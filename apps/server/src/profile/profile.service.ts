import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, User, TwoFaBackupCode } from '@common/database/entities';
import { Equal, Repository } from 'typeorm';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import {
  GenerateTwoFaResponseDTO,
  GetProfileResponseDTO,
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
import { AuthSetPasswordEvent } from '@shared/events/auth.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { isNumberString } from 'class-validator';
import { generateRandomCode } from '@common/utils/helpers/auth.helpers';
import { RequestContext } from '@common/utils/request/request-context';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TwoFaBackupCode)
    private readonly backupCodesRepository: Repository<TwoFaBackupCode>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getProfile(ctx: RequestContext) {
    const profile = await this.profileRepository.findOne({
      where: { userId: Equal(ctx.activeUser.id!) },
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

    // TODO emit event

    return ResponseFormatter.success(
      profileSuccessMessages.fetchedProfile,
      new GetProfileResponseDTO(profile),
    );
  }

  async updateProfile(ctx: RequestContext, data: UpdateProfileDto) {
    const { firstName, lastName } = data;

    const profile = await this.profileRepository.findOne({
      where: { userId: Equal(ctx.activeUser.id!) },
    });

    if (!profile) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    const updatedProfile = this.profileRepository.create({
      firstName,
      lastName,
    });

    await this.profileRepository.update(
      { userId: ctx.activeUser.id },
      updatedProfile,
    );

    // TODO emit event

    return ResponseFormatter.success(
      profileSuccessMessages.updatedProfile,
      new GetProfileResponseDTO(Object.assign({}, profile, updatedProfile)),
    );
  }

  async updatePassword(ctx: RequestContext, data: UpdatePasswordDto) {
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

    if (!compareSync(oldPassword, ctx.activeUser.password!)) {
      throw new IBadRequestException({
        message: profileErrorMessages.incorrectOldPassword,
      });
    }

    await this.userRepository.update(
      { id: ctx.activeUser.id },
      {
        resetPasswordToken: null as any,
        resetPasswordExpires: null as any,
        password: hashSync(newPassword, 12),
        lastPasswordChange: moment().toDate(),
      },
    );

    const event = new AuthSetPasswordEvent(ctx.activeUser);
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(profileSuccessMessages.updatedPassword);
  }

  async generateTwoFA(ctx: RequestContext) {
    // TODO emit event
    // TODO encrypt secret in DB

    if (ctx.activeUser.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyEnabled,
      });
    }

    const { base32, otpauth_url: otpAuthURL } = speakeasy.generateSecret({
      length: 20,
    });

    const url = speakeasy.otpauthURL({
      label: encodeURIComponent(ctx.activeUser.email!),
      secret: base32,
      encoding: 'base32',
    });
    const qrCodeImage = await QRCode.toDataURL(url);

    await this.userRepository.update(
      { id: ctx.activeUser.id },
      {
        // TODO encrypt
        twofaSecret: base32,
      },
    );
    return ResponseFormatter.success(
      profileSuccessMessages.generatedTwoFA,
      new GenerateTwoFaResponseDTO({
        otpAuthURL,
        qrCodeImage,
      }),
    );
  }

  async verifyTwoFA(ctx: RequestContext, data: UpdateTwoFADto) {
    if (ctx.activeUser.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyEnabled,
      });
    }

    const verified = speakeasy.totp.verify({
      secret: ctx.activeUser.twofaSecret!,
      encoding: 'base32',
      token: data.code,
    });

    if (!verified) {
      throw new IBadRequestException({
        message: profileErrorMessages.incorrectTwoFaCode,
      });
    }

    const backupCodes = new Array(12)
      .fill(null)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map((_) => generateRandomCode(6));

    await this.backupCodesRepository.insert(
      backupCodes.map((backupCode) => ({
        userId: ctx.activeUser.id,
        value: hashSync(backupCode, 12),
      })),
    );

    await this.userRepository.update(
      { id: ctx.activeUser.id },
      {
        twofaEnabled: true,
      },
    );
    return ResponseFormatter.success(
      profileSuccessMessages.twoFaEnabled,
      backupCodes,
    );
  }

  async disableTwoFA(ctx: RequestContext, data: UpdateTwoFADto) {
    // TODO emit event

    if (!ctx.activeUser.twofaEnabled) {
      throw new IBadRequestException({
        message: profileErrorMessages.twoFaAlreadyDisabled,
      });
    }

    if (!isNumberString(data.code)) {
      const backupCodes = await this.backupCodesRepository.findBy({
        userId: Equal(ctx.activeUser.id!),
      });
      const match = backupCodes.find((backupCode) => {
        return compareSync(data.code, backupCode.value);
      });
      if (!match) {
        throw new IBadRequestException({
          message: profileErrorMessages.incorrectTwoFaCode,
        });
      }
      await this.backupCodesRepository.softDelete({ id: match.id });
    } else {
      const verified = speakeasy.totp.verify({
        secret: ctx.activeUser.twofaSecret!,
        encoding: 'base32',
        token: data.code,
      });
      if (!verified) {
        throw new IBadRequestException({
          message: profileErrorMessages.incorrectTwoFaCode,
        });
      }
    }

    await this.userRepository.update(
      { id: ctx.activeUser.id },
      {
        twofaEnabled: false,
      },
    );

    await this.backupCodesRepository.softDelete({
      userId: ctx.activeUser.id,
    });

    return ResponseFormatter.success(profileSuccessMessages.twoFaDisabled);
  }
}
