import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  CompanyStatuses,
  Profile,
  Settings,
  User,
  UserStatuses,
} from 'src/common/database/entities';
import { Repository, MoreThan } from 'typeorm';
import {
  AuthOTPResponseDTO,
  BusinessSignupDto,
  IndividualSignupDto,
  LicensedEntitySignupDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  TwoFADto,
  VerifyEmailDto,
} from './dto/index.dto';
import {
  IBadRequestException,
  IPreconditionFailedException,
} from 'src/common/utils/exceptions/exceptions';
import { userErrors } from '@users/user.errors';
import {
  ResponseDTO,
  ResponseFormatter,
} from '@common/utils/response/response.formatter';
import { compareSync, hashSync } from 'bcrypt';
import { authErrors } from '@auth/auth.errors';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import * as moment from 'moment';
import { Role } from 'src/common/database/entities/role.entity';
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
import { TwoFaBackupCode } from '@common/database/entities/twofabackupcode.entity';

import { GetUserResponseDTO } from '@users/dto/index.dto';
import { BUSINESS_SETTINGS_NAME } from '@settings/settings.constants';
import { commonErrors } from '@common/constants';
import { BusinessSettings } from '@settings/types';

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
    private readonly auth: Auth,
    private readonly eventEmitter: EventEmitter2,
    private readonly config: ConfigService,
  ) {}

  async signup(data: any, companyType: CompanyTypes) {
    // Check if user with this email already exists
    const userExists = await this.userRepository.count({
      where: {
        email: data.email.trim().toLowerCase(),
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
          rcNumber: data.rcNumber,
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
        name: BUSINESS_SETTINGS_NAME,
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

          const allowedSubTypesForType: string[] = (
            parsedBusinessSettings.companySubtypes as any
          )[companyType];

          if (
            !allowedSubTypesForType.some((subtype) =>
              subtype.includes(companySubtype),
            ) &&
            allowedSubTypesForType.length
          ) {
            throw new IBadRequestException({
              message: commonErrors.invalidValue(companyType, companySubtype),
            });
          }
        }

        if (apiConsumerRole) {
          const companyCreated = await this.companyRepository.save({
            name: businessName,
            type: companyType,
            subtype: companySubtype,
            rcNumber,
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

          const otpData: any = {};
          // TODO remove this.
          if (new Date() < new Date('2023-12-31')) {
            otpData.otp = otp.toString();
          }

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              ...otpData,
              company: companyCreated,
            }),
          );
        } else {
          throw new IBadRequestException({
            message: authErrors.errorOccurredCreatingUser,
          });
        }
      case CompanyTypes.INDIVIDUAL:
        const { accountNumber: iAccountNumber, bvn } =
          data as IndividualSignupDto;

        if (apiConsumerRole) {
          const companyCreated = await this.companyRepository.save({
            name: `${firstName} ${lastName}`,
            type: companyType,
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
            bvn: hashSync(bvn, 12),
          });

          const event = new AuthSignupEvent(user, { otp });

          user.company = companyCreated;

          this.eventEmitter.emit(event.name, event);

          const otpData: any = {};
          // TODO remove this.
          if (new Date() < new Date('2023-12-31')) {
            otpData.otp = otp.toString();
          }

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              ...otpData,
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

          const allowedSubTypesForType: string[] = (
            parsedBusinessSettings.companySubtypes as any
          )[companyType];

          if (
            !allowedSubTypesForType.some((subtype) =>
              subtype.includes(licensedEntityCompanySubtype),
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

          const event = new AuthSignupEvent(user, { otp });

          user.company = companyCreated;

          this.eventEmitter.emit(event.name, event);

          const otpData: any = {};
          // TODO remove this.
          if (new Date() < new Date('2023-12-31')) {
            otpData.otp = otp.toString();
          }

          return ResponseFormatter.success(
            authSuccessMessages.signup,
            new GetUserResponseDTO({
              ...user,
              ...otpData,
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

  async login({ email, password }: LoginDto): Promise<ResponseDTO<string>>;
  async login({
    email,
    password,
    code,
  }: TwoFADto): Promise<ResponseDTO<string>>;
  async login({
    email,
    password,
    code,
  }: LoginDto & TwoFADto): Promise<ResponseDTO<string>> {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
      relations: {
        company: true,
      },
    });

    // TODO do not throw error if email not found
    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userWithEmailNotFound(email),
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

    if (!compareSync(password, user.password!)) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
      });
    }

    // TODO
    // if (user.status !== UserStatuses.ACTIVE) {
    //   throw new IBadRequestException({
    //     message: authErrors.accountNotActive(user.status!),
    //   });
    // }

    if (user.twofaEnabled) {
      if (!code) {
        throw new IPreconditionFailedException({
          message: userErrors.provide2FACode,
        });
      }
      if (!isNumberString(code)) {
        const backupCodes = await this.backupCodesRepository.findBy({
          userId: user.id,
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

    const accessToken = await this.auth.sign({ id: user.id });

    const verifyToken = await this.auth.verify<{ iat: number }>(accessToken);

    user.lastLogin = moment(verifyToken.iat * 1000).toDate();
    await this.userRepository.save(user);

    const event = new AuthLoginEvent(user);
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      authSuccessMessages.login(isFirstLogin),
      accessToken,
    );
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOneBy({
      email,
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
        email,
      },
    });

    // TODO do not throw error if email not found;
    if (!user) {
      throw new IBadRequestException({
        message: `User with email - ${email} not found.`,
      });
    }

    if (user.emailVerified) {
      throw new IBadRequestException({
        message: `User already verified.`,
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

    return ResponseFormatter.success(
      authSuccessMessages.verifyEmail,
      new GetUserResponseDTO(user),
    );
  }

  async resendOtp({ email }: ResendOtpDto) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    // TODO do not throw error if email not found;
    if (!user) {
      throw new IBadRequestException({
        message: `User with email - ${email} not found.`,
      });
    }

    if (user.emailVerified) {
      throw new IBadRequestException({
        message: `User already verified.`,
      });
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

    const otpData: any = {};

    // TODO remove this.
    if (new Date() < new Date('2023-12-31')) {
      otpData.otp = otp.toString();
    }

    return ResponseFormatter.success(
      authSuccessMessages.resendOtp,
      new AuthOTPResponseDTO(otpData),
    );
  }
}
