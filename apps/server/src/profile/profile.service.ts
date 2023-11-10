import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, User } from 'src/common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { ResponseFormatter } from 'src/common/utils/common/response.util';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/index.dto';
import { userErrors } from 'src/common/constants/errors/user.errors';
import { compareSync, hashSync } from 'bcrypt';
import moment from 'moment';
import { authErrors } from 'src/common/constants/errors/auth.errors';

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
    });

    if (!profile) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    return ResponseFormatter.success('', profile);
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

    return ResponseFormatter.success('', profile);
  }

  async updatePassword(data: UpdatePasswordDto) {
    const { oldPassword, newPassword } = data;

    if (!compareSync(oldPassword, this.requestContext.user!.password)) {
      throw new IBadRequestException({
        message: authErrors.invalidCredentials,
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

    return ResponseFormatter.success('');
  }
}
