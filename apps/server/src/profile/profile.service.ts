import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, User } from 'src/common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import {
  UpdatePasswordDto,
  UpdateProfileDto,
  UpdateTwoFADto,
} from './dto/index.dto';
import { userErrors } from '@users/user.errors';
import { compareSync, hashSync } from 'bcrypt';
import * as moment from 'moment';
import {
  profileErrorMessages,
  profileSuccessMessages,
} from '@profile/profile.constants';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class ProfileService {
  constructor(
    private readonly requestContext: RequestContextService,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile() {
    const profile = await this.profileRepository.findOne({
      where: { userId: this.requestContext.user!.id },
      relations: {
        user: {
          role: {
            permissions: true,
            parent: true,
          },
        },
      },
    });

    if (!profile) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    // TODO do this in a DTO
    delete profile.user!.password;
    delete profile.user!.twofaSecret;

    // TODO emit event

    return ResponseFormatter.success(
      profileSuccessMessages.fetchedProfile,
      profile,
    );
  }

  async updateProfile(data: UpdateProfileDto) {
    const { firstName, lastName } = data;

    const profile = await this.profileRepository.findOne({
      where: { userId: this.requestContext.user!.id },
    });

    if (!profile) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    await this.profileRepository.update(
      { userId: this.requestContext.user!.id },
      this.profileRepository.create({
        firstName,
        lastName,
      }),
    );

    // TODO emit event

    return ResponseFormatter.success(
      profileSuccessMessages.updatedProfile,
      profile,
    );
  }

  async updatePassword(data: UpdatePasswordDto) {
    const { oldPassword, newPassword, confirmPassword } = data;

    if (oldPassword === newPassword) {
      throw new IBadRequestException({
        message: profileErrorMessages.sameOldPassword,
      });
    }

    if (newPassword !== confirmPassword) {
      throw new IBadRequestException({
        message: profileErrorMessages.passwordMismatch,
      });
    }

    if (!compareSync(oldPassword, this.requestContext.user!.password!)) {
      throw new IBadRequestException({
        message: profileErrorMessages.invalidCredentials,
      });
    }

    await this.userRepository.update(
      { id: this.requestContext.user!.id },
      {
        resetPasswordToken: null as any,
        resetPasswordExpires: null as any,
        password: hashSync(newPassword, 12),
        lastPasswordChange: moment().toDate(),
      },
    );

    // TODO emit event

    return ResponseFormatter.success(profileSuccessMessages.updatedPassword);
  }

  async generateTwoFA() {
    // TODO emit event
    // TODO encrypt secret in DB

    if (this.requestContext.user!.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyEnabled,
      });
    }

    const { base32, otpauth_url: otpAuthURL } = speakeasy.generateSecret({
      length: 20,
    });

    const url = speakeasy.otpauthURL({
      label: encodeURIComponent(this.requestContext.user!.email!),
      secret: base32,
      encoding: 'base32',
    });
    const qrCodeImage = await QRCode.toDataURL(url);

    await this.userRepository.update(
      { id: this.requestContext.user!.id },
      {
        twofaSecret: base32,
      },
    );
    return ResponseFormatter.success(profileSuccessMessages.generatedTwoFA, {
      otpAuthURL,
      qrCodeImage,
    });
  }

  async verifyTwoFA(data: UpdateTwoFADto) {
    if (this.requestContext.user!.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyEnabled,
      });
    }

    const verified = speakeasy.totp.verify({
      secret: this.requestContext.user!.twofaSecret!,
      encoding: 'base32',
      token: data.code,
    });

    if (!verified) {
      throw new IBadRequestException({
        message: profileErrorMessages.invalidCredentials,
      });
    }

    await this.userRepository.update(
      { id: this.requestContext.user!.id },
      {
        twofaEnabled: true,
      },
    );
    return ResponseFormatter.success(profileSuccessMessages.twoFaEnabled);
  }

  async disableTwoFA() {
    // TODO emit event
    // TODO delete all recovery codes

    if (!this.requestContext.user!.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyDisabled,
      });
    }

    await this.userRepository.update(
      { id: this.requestContext.user!.id },
      {
        twofaEnabled: false,
      },
    );
    return ResponseFormatter.success(
      profileSuccessMessages.twoFaDisabled,
      null,
    );
  }
}
