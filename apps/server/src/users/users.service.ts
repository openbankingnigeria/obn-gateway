import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto/index.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, Role, User } from 'src/common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { ResponseFormatter } from 'src/common/utils/common/response.util';
import { userErrors } from 'src/common/constants/errors/user.errors';
import { roleErrors } from 'src/common/constants/errors/role.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
} from 'src/shared/events/user.event';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import * as moment from 'moment';
import { userSuccessMessages } from '@common/constants/user/user.constants';

@Injectable()
export class UsersService {
  constructor(
    private readonly requestContext: RequestContextService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly eventEmitter: EventEmitter2,
    private readonly auth: Auth,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createUser(data: CreateUserDto) {
    const { email, firstName, lastName, roleId } = data;

    const userExists = await this.userRepository.count({
      where: { email },
    });

    if (userExists) {
      throw new IBadRequestException({
        message: userErrors.userWithEmailAlreadyExists(data.email),
      });
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, parentId: this.requestContext.user!.role.parentId },
      relations: { permissions: true },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    const resetToken = await this.auth.getToken();
    const hashedResetToken = await this.auth.hashToken(resetToken);

    const user = await this.userRepository.save(
      this.userRepository.create({
        email,
        roleId,
        password: '',
        companyId: this.requestContext.user!.companyId,
        resetPasswordToken: hashedResetToken,
        resetPasswordExpires: moment().add(24, 'hours').toDate(),
        profile: {
          firstName,
          lastName,
        },
      }),
    );

    const event = new UserCreatedEvent(
      this.requestContext.user!,
      user,
      resetToken,
      {
        pre: null,
        post: user,
      },
    );

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(userSuccessMessages.createdUser, user);
  }

  async listUsers() {
    const users = await this.userRepository.find({
      where: { companyId: this.requestContext.user!.companyId },
      relations: { profile: true },
    });
    return ResponseFormatter.success(userSuccessMessages.fetchedUsers, users);
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, companyId: this.requestContext.user!.companyId },
      relations: { profile: true },
    });

    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    return ResponseFormatter.success(userSuccessMessages.fetchedUser, user);
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const { firstName, lastName, status, roleId } = data;

    const user = await this.userRepository.findOne({
      where: { id, companyId: this.requestContext.user!.companyId },
      relations: { profile: true },
    });

    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    const updatedUser = this.userRepository.create({
      roleId,
      status,
    });

    const updatedProfile = this.profileRepository.create({
      firstName,
      lastName,
    });

    await this.userRepository.update({ id: user.id }, updatedUser);
    await this.profileRepository.update(
      { id: user.profile.id },
      updatedProfile,
    );
    updatedUser.profile = updatedProfile;

    const event = new UserUpdatedEvent(this.requestContext.user!, user, {
      pre: user,
      post: updatedUser,
    });

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userSuccessMessages.updatedUser,
      updatedUser,
    );
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, companyId: this.requestContext.user!.companyId },
    });

    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    await this.userRepository.softDelete({ id: user.id });

    const event = new UserDeletedEvent(this.requestContext.user!, user, {
      pre: user,
      post: null,
    });

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(userSuccessMessages.deletedUser, null);
  }
}
