import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  Profile,
  User,
  UserStatuses,
} from 'src/common/database/entities';
import { Repository, MoreThan } from 'typeorm';
import {
  AuthOTPResponseDTO,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  SignupDto,
  TwoFADto,
  VerifyEmailDto,
} from './dto/index.dto';
import {
  IBadRequestException,
  IPreconditionFailedException,
} from 'src/common/utils/exceptions/exceptions';
import { userErrors } from '@users/user.errors';
import {
  ApiResponse,
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
import { ROLES } from '@common/database/constants';
import { generateOtp } from '@common/utils/helpers/auth.helpers';
import { ConfigService } from '@nestjs/config';
import { isNumberString } from 'class-validator';
import { TwoFaBackupCode } from '@common/database/entities/twofabackupcode.entity';

import { GetUserResponseDTO } from '@users/dto/index.dto';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async signup(data: SignupDto) {
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

    const {
      companyName,
      companyRole,
      companyType,
      country,
      email,
      firstName,
      lastName,
      password,
      confirmPassword,
      phone,
    } = data;

    if (password !== confirmPassword) {
      throw new IBadRequestException({
        message: authErrors.passwordMismatch,
      });
    }

    const apiConsumerRole = await this.roleRepository.findOne({
      where: {
        slug: ROLES.ADMIN,
        parent: { slug: ROLES.API_CONSUMER },
      },
      select: {
        id: true,
      },
    });

    if (apiConsumerRole) {
      const companyCreated = await this.companyRepository.save({
        name: companyName,
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
          country,
          companyRole,
        },
      });

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

  async login({ email, password }: LoginDto): Promise<ApiResponse<string>>;
  async login({
    email,
    password,
    code,
  }: TwoFADto): Promise<ApiResponse<string>>;
  async login({
    email,
    password,
    code,
  }: LoginDto & TwoFADto): Promise<ApiResponse<string>> {
    const user = await this.userRepository.findOne({
      where: {
        email,
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

    user.lastLogin = moment().toDate();

    await this.userRepository.save(user);
    const accessToken = await this.auth.sign({ id: user.id });

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
  ): Promise<ApiResponse<null>>;
  async resetPassword(
    { confirmPassword, password }: ResetPasswordDto,
    resetToken: string,
  ): Promise<ApiResponse<null>>;
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
    if (
      this.config.get('server.nodeEnv') === 'development' &&
      new Date() < new Date('2023-12-31')
    ) {
      otpData.otp = otp.toString();
    }

    return ResponseFormatter.success(
      authSuccessMessages.resendOtp,
      new AuthOTPResponseDTO(otpData),
    );
  }
}
