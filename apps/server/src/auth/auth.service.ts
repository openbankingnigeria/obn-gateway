import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  CompanyStatuses,
  Profile,
  Settings,
  User,
  UserStatuses,
  Role,
  TwoFaBackupCode,
} from '@common/database/entities';
import { Repository, MoreThan, Equal } from 'typeorm';
import {
  BusinessSignupDto,
  IndividualSignupDto,
  LicensedEntitySignupDto,
  LoginDto,
  LoginResponseDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  TwoFADto,
  VerifyEmailDto,
} from './dto/index.dto';
import {
  IBadRequestException,
  IPreconditionFailedException,
} from '@common/utils/exceptions/exceptions';
import { userErrors } from '@users/user.errors';
import {
  ResponseDTO,
  ResponseFormatter,
} from '@common/utils/response/response.formatter';
import { compareSync, hashSync } from 'bcryptjs';
import { authErrors } from '@auth/auth.errors';
import { Auth } from '@common/utils/authentication/auth.helper';
import * as moment from 'moment';
import { authSuccessMessages } from '@auth/auth.constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AuthLoginEvent,
  AuthResendOtpEvent,
  AuthResetPasswordEvent,
  AuthResetPasswordRequestEvent,
  AuthSignupEvent,
} from '@shared/events/auth.event';
import * as speakeasy from 'speakeasy';
import { CompanyTypes, ROLES } from '@common/database/constants';
import { generateOtp } from '@common/utils/helpers/auth.helpers';
import { ConfigService } from '@nestjs/config';
import { isNumberString } from 'class-validator';

import { GetUserResponseDTO } from '@users/dto/index.dto';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';
import { commonErrors } from '@common/constants';
import { BusinessSettings } from 'src/settings/types';
import { CompanyTiers } from '@company/types';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(TwoFaBackupCode)
    private readonly backupCodesRepository: Repository<TwoFaBackupCode>,
    private readonly kongConsumerService: KongConsumerService,
    private readonly auth: Auth,
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  async signup(data: any, companyType: CompanyTypes) {
    // Check if user with this email already exists
    const userExists = await this.userRepository.count({
      where: {
        email: Equal(data.email.trim().toLowerCase()),
      },
    });

    // TODO Add condition for when user is already added to another team?
    // If the user already exists, throw an error.
    if (userExists > 0) {
      throw new IBadRequestException({
        message: userErrors.userWithEmailAlreadyExists(data.email),
      });
    }

    if (data.rcNumber) {
      const companyExists = await this.companyRepository.findOne({
        where: {
          rcNumber: Equal(data.rcNumber),
        },
      });

      if (companyExists) {
        throw new IBadRequestException({
          message: userErrors.companyExists,
        });
      }
    }

    const { email, firstName, lastName, password, confirmPassword, phone } =
      data;

    if (password !== confirmPassword) {
      throw new IBadRequestException({
        message: authErrors.passwordMismatch,
      });
    }

    // Validate company type
    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: Equal(BUSINESS_SETTINGS_NAME),
      },
    });

    const apiConsumerRole = await this.roleRepository.findOne({
      where: {
        slug: ROLES.ADMIN,
        parent: { slug: ROLES.API_CONSUMER },
      },
      select: {
        id: true,
      },
    });

    switch (companyType) {
      case CompanyTypes.BUSINESS:
        const {
          accountNumber,
          companyName: businessName,
          companySubtype,
          rcNumber,
        } = data as BusinessSignupDto;

        if (businessSettings) {
          const parsedBusinessSettings: BusinessSettings = JSON.parse(
            businessSettings.value,
          );

          const allowedSubTypesForType: { value: string; default: boolean }[] =
            (parsedBusinessSettings.companySubtypes as any)[companyType];

          if (
            !allowedSubTypesForType.some((subtype) =>
              subtype.value.includes(companySubtype),
            ) &&
            allowedSubTypesForType.length
          ) {
            throw new IBadRequestException({
              message: commonErrors.invalidValue(companyType, companySubtype),
            });
          }
        }

        // create in ACL for tier 0
        if (apiConsumerRole) {
          const companyCreated = await this.companyRepository.save({
            name: businessName,
            type: companyType,
            subtype: companySubtype,
            rcNumber,
            tier: CompanyTiers.TIER_0,
          });

          const otp = generateOtp(6);

          const user = await this.userRepository.save({
            email: email.trim().toLowerCase(),
            password: hashSync(password, 12),
            roleId: apiConsumerRole.id,
            companyId: companyCreated.id,
            emailVerificationOtp: otp.toString(),
            emailVerificationExpires: moment()
              .add(this.config.get('auth.defaultOtpExpiresMinutes'), 'minutes')
              .toDate(),
            profile: {
              firstName,
              lastName,
              phone,
            },
            accountNumber,
            status: UserStatuses.ACTIVE,
          });

          await this.companyRepository.update(
            { id: companyCreated.id },
            { primaryUser: user.id as any },
          );

          const event = new AuthSignupEvent(user, { otp });

          user.company = companyCreated;

          this.eventEmitter.emit(event.name, event);

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              company: companyCreated,
            }),
          );
        } else {
          throw new IBadRequestException({
            message: authErrors.errorOccurredCreatingUser,
          });
        }
      case CompanyTypes.INDIVIDUAL:
        const userWithBVNexists = await this.userRepository.findOne({
          where: {
            bvn: Equal(data.bvn),
          },
        });

        if (userWithBVNexists) {
          throw new IBadRequestException({
            message: 'User already exists',
          });
        }

        const { accountNumber: iAccountNumber, bvn } =
          data as IndividualSignupDto;

        if (apiConsumerRole) {
          const companyCreated = await this.companyRepository.save({
            name: `${firstName} ${lastName}`,
            type: companyType,
            tier: CompanyTiers.TIER_0,
          });

          const otp = generateOtp(6);

          const user = await this.userRepository.save({
            email: email.trim().toLowerCase(),
            password: hashSync(password, 12),
            roleId: apiConsumerRole.id,
            companyId: companyCreated.id,
            emailVerificationOtp: otp.toString(),
            emailVerificationExpires: moment()
              .add(this.config.get('auth.defaultOtpExpiresMinutes'), 'minutes')
              .toDate(),
            profile: {
              firstName,
              lastName,
              phone,
            },
            accountNumber: iAccountNumber,
            status: UserStatuses.ACTIVE,
            bvn,
          });

          await this.companyRepository.update(
            { id: companyCreated.id },
            { primaryUser: user.id as any },
          );

          const event = new AuthSignupEvent(user, { otp });

          user.company = companyCreated;

          this.eventEmitter.emit(event.name, event);

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              company: companyCreated,
            }),
          );
        } else {
          throw new IBadRequestException({
            message: authErrors.errorOccurredCreatingUser,
          });
        }
      case CompanyTypes.LICENSED_ENTITY:
        const {
          companySubtype: licensedEntityCompanySubtype,
          companyName: companyName,
        } = data as LicensedEntitySignupDto;
        if (businessSettings) {
          const parsedBusinessSettings: BusinessSettings = JSON.parse(
            businessSettings.value,
          );

          const allowedSubTypesForType: { value: string; default: boolean }[] =
            (parsedBusinessSettings.companySubtypes as any)[companyType];

          if (
            !allowedSubTypesForType.some((subtype) =>
              subtype.value.includes(licensedEntityCompanySubtype),
            ) &&
            allowedSubTypesForType.length
          ) {
            throw new IBadRequestException({
              message: commonErrors.invalidValue(
                companyType,
                licensedEntityCompanySubtype,
              ),
            });
          }
        }

        if (apiConsumerRole) {
          const companyCreated = await this.companyRepository.save({
            name: companyName,
            type: companyType,
            subtype: licensedEntityCompanySubtype,
          });

          const otp = generateOtp(6);

          const user = await this.userRepository.save({
            email: email.trim().toLowerCase(),
            password: hashSync(password, 12),
            roleId: apiConsumerRole.id,
            companyId: companyCreated.id,
            status: UserStatuses.ACTIVE,
            emailVerificationOtp: otp.toString(),
            emailVerificationExpires: moment()
              .add(this.config.get('auth.defaultOtpExpiresMinutes'), 'minutes')
              .toDate(),
            profile: {
              firstName,
              lastName,
              phone,
            },
          });

          await this.companyRepository.update(
            { id: companyCreated.id },
            { primaryUser: user.id as any },
          );

          const event = new AuthSignupEvent(user, { otp });

          user.company = companyCreated;

          this.eventEmitter.emit(event.name, event);

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              company: companyCreated,
            }),
          );
        } else {
          throw new IBadRequestException({
            message: authErrors.errorOccurredCreatingUser,
          });
        }
    }
  }

  async login({ email, password }: LoginDto): Promise<ResponseDTO>;
  async login({ email, password, code }: TwoFADto): Promise<ResponseDTO>;
  async login({
    email,
    password,
    code,
  }: LoginDto & TwoFADto): Promise<ResponseDTO> {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
      });
    }

    if (!compareSync(password, user.password!)) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
      });
    }

    if (!user.emailVerified) {
      throw new IBadRequestException({
        message: userErrors.userEmailNotVerified,
      });
    }

    if (user.company?.status !== CompanyStatuses.ACTIVE) {
      throw new IBadRequestException({
        message: commonErrors.genericNoAccessError,
      });
    }

    if (user.status !== UserStatuses.ACTIVE) {
      throw new IBadRequestException({
        message: authErrors.accountNotActive(user.status!),
      });
    }

    if (user.twofaEnabled) {
      if (!code) {
        throw new IPreconditionFailedException({
          message: userErrors.provide2FACode,
        });
      }
      if (!isNumberString(code)) {
        const backupCodes = await this.backupCodesRepository.findBy({
          userId: Equal(user.id!),
        });
        const match = backupCodes.find((backupCode) => {
          return compareSync(code, backupCode.value);
        });
        if (!match) {
          throw new IBadRequestException({
            message: authErrors.invalidTwoFA,
          });
        }
        await this.backupCodesRepository.softDelete({ id: match.id });
      } else {
        const verified = speakeasy.totp.verify({
          secret: user.twofaSecret!,
          encoding: 'base32',
          token: code,
        });
        if (!verified) {
          throw new IBadRequestException({
            message: authErrors.invalidTwoFA,
          });
        }
      }
    }

    const isFirstLogin = !user.lastLogin;

    const accessToken = await this.auth.sign({
      id: user.id,
      count: 0,
    });

    const refreshToken = await this.auth.sign(
      {
        id: user.id,
      },
      { secret: user.password },
    );

    const verifyToken = await this.auth.verify<{ iat: number; exp: number }>(
      accessToken,
    );

    user.lastLogin = moment(verifyToken.iat * 1000).toDate();
    user.refreshToken = await this.auth.hashToken(refreshToken);
    await this.userRepository.save(user);

    const event = new AuthLoginEvent(user);
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      authSuccessMessages.login(isFirstLogin),
      new LoginResponseDto({
        tokenType: 'Bearer',
        accessToken,
        refreshToken,
        expiresIn: moment(verifyToken.exp * 1000).diff(moment(), 'seconds'),
      }),
    );
  }

  async refreshToken(token: string) {
    let decoded: { id: string; count: number; iat: number }, user;
    const refreshTokenLimit = 96;
    try {
      user = await this.userRepository.findOneByOrFail({
        refreshToken: await this.auth.hashToken(token),
      });
      decoded = await this.auth.verify(token, user.password);
      if (decoded.id !== user.id) {
        throw new IBadRequestException({
          message: authErrors.invalidCredentials,
        });
      }
    } catch (err) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
        _meta: err,
      });
    }

    if (decoded.count >= refreshTokenLimit) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
      });
    }

    const accessToken = await this.auth.sign({
      id: user.id,
      count: decoded.count + 1,
    });

    const refreshToken = await this.auth.sign(
      {
        id: user.id,
      },
      { secret: user.password },
    );

    const verifyToken = await this.auth.verify<{ iat: number; exp: number }>(
      accessToken,
    );

    user.lastLogin = moment(verifyToken.iat * 1000).toDate();
    user.refreshToken = await this.auth.hashToken(refreshToken);
    await this.userRepository.save(user);

    return ResponseFormatter.success(
      authSuccessMessages.login(false),
      new LoginResponseDto({
        tokenType: 'Bearer',
        accessToken,
        refreshToken,
        expiresIn: moment(verifyToken.exp * 1000).diff(moment(), 'seconds'),
      }),
    );
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({
      email: Equal(email),
    });

    if (!user) {
      return ResponseFormatter.success(
        authSuccessMessages.forgotPassword(email),
      );
    }

    const resetToken = await this.auth.getToken();
    const hashedResetToken = await this.auth.hashToken(resetToken);

    await this.userRepository.update(
      { id: user.id },
      {
        resetPasswordToken: hashedResetToken,
        resetPasswordExpires: moment().add(10, 'minutes').toDate(),
      },
    );

    const event = new AuthResetPasswordRequestEvent(user, {
      token: resetToken,
    });
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(authSuccessMessages.forgotPassword(email));
  }

  async resetPassword(
    { confirmPassword, password }: ResetPasswordDto,
    user: User,
  ): Promise<ResponseDTO<null>>;
  async resetPassword(
    { confirmPassword, password }: ResetPasswordDto,
    resetToken: string,
  ): Promise<ResponseDTO<null>>;
  async resetPassword(
    { confirmPassword, password }: any,
    userOrToken: any,
  ): Promise<any> {
    let userToUpdate: User | null =
      userOrToken instanceof User ? userOrToken : null;

    if (!userToUpdate) {
      userToUpdate = await this.userRepository.findOneBy({
        resetPasswordToken: await this.auth.hashToken(userOrToken),
        resetPasswordExpires: MoreThan(moment().toDate()),
      });

      if (!userToUpdate) {
        throw new IBadRequestException({
          message: authErrors.resetPasswordInvalid,
        });
      }
    }

    if (password !== confirmPassword) {
      throw new IBadRequestException({
        message: authErrors.passwordMismatch,
      });
    }

    if (compareSync(password, userToUpdate!.password!)) {
      throw new IBadRequestException({
        message: authErrors.sameOldPassword,
      });
    }

    await this.userRepository.update(
      { id: userToUpdate?.id },
      {
        resetPasswordToken: null as any,
        resetPasswordExpires: null as any,
        password: hashSync(password, 12),
        lastPasswordChange: moment().toDate(),
        emailVerified: true,
      },
    );

    const event = new AuthResetPasswordEvent(userToUpdate);
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userOrToken instanceof User
        ? authSuccessMessages.changePassword
        : authSuccessMessages.resetPassword,
    );
  }

  async setup(data: SetupDto, token: string) {
    const { firstName, lastName, password, confirmPassword } = data;

    if (password !== confirmPassword) {
      throw new IBadRequestException({
        message: authErrors.passwordMismatch,
      });
    }

    const user = await this.userRepository.findOneBy({
      resetPasswordToken: await this.auth.hashToken(token),
      resetPasswordExpires: MoreThan(moment().toDate()),
    });

    // TODO what message to display here
    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    await this.userRepository.update(
      { id: user.id },
      {
        resetPasswordToken: null as any,
        resetPasswordExpires: null as any,
        password: hashSync(password, 12),
        lastPasswordChange: moment().toDate(),
        status: UserStatuses.ACTIVE,
        emailVerified: true,
      },
    );

    await this.profileRepository.update(
      {
        userId: user.id,
      },
      {
        firstName,
        lastName,
      },
    );

    // TODO emit event

    return ResponseFormatter.success(authSuccessMessages.signup);
  }

  async verifyEmail({ email, otp }: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
      relations: {
        company: true,
      },
    });

    if (!user) {
      throw new IBadRequestException({
        message: `Invalid OTP.`,
      });
    }

    if (user.emailVerified) {
      throw new IBadRequestException({
        message: `Invalid OTP.`,
      });
    }

    if (
      user.emailVerificationOtp !== otp ||
      (user.emailVerificationExpires &&
        new Date(user.emailVerificationExpires).getTime() <
          new Date().getTime())
    ) {
      throw new IBadRequestException({
        message: `Invalid OTP.`,
      });
    }

    await this.userRepository.update(
      { id: user.id },
      {
        emailVerified: true,
        emailVerificationExpires: undefined,
        emailVerificationOtp: undefined,
      },
    );

    // Create a consumer for development for the new company
    await this.kongConsumerService.updateOrCreateConsumer(
      KONG_ENVIRONMENT.DEVELOPMENT,
      {
        custom_id: user.company!.id,
      },
    );

    return ResponseFormatter.success(
      authSuccessMessages.verifyEmail,
      new GetUserResponseDTO(user),
    );
  }

  async resendOtp({ email }: ResendOtpDto) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });

    if (!user) {
      return ResponseFormatter.success(authSuccessMessages.resendOtp);
    }

    if (user.emailVerified) {
      return ResponseFormatter.success(authSuccessMessages.resendOtp);
    }

    const otp = generateOtp(6);
    const expiry = moment()
      .add(this.config.get('auth.defaultOtpExpiresMinutes'), 'minutes')
      .toDate();

    await this.userRepository.update(
      { email },
      {
        emailVerificationOtp: otp.toString(),
        emailVerificationExpires: expiry,
      },
    );

    const event = new AuthResendOtpEvent(user, {
      otp: otp.toString(),
    });
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(authSuccessMessages.resendOtp);
  }
}
