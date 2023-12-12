import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  GetUserResponseDTO,
  UpdateUserDto,
} from './dto/index.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Profile,
  Role,
  User,
  UserStatuses,
} from 'src/common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { userErrors } from '@users/user.errors';
import { roleErrors } from '@roles/role.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  UserDeactivatedEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
} from 'src/shared/events/user.event';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import * as moment from 'moment';
import { userSuccessMessages } from '@users/user.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { UserReactivatedEvent } from 'src/shared/events/user.event';

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

  // TODO confirm that this roleId belongs to the comapny.
  async createUser(data: CreateUserDto) {
    const { email, roleId } = data;

    const userExists = await this.userRepository.count({
      where: { email },
    });

    if (userExists) {
      throw new IBadRequestException({
        message: userErrors.userWithEmailAlreadyExists(data.email),
      });
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: roleId,
        parentId: this.requestContext.user!.role.parentId,
        companyId: this.requestContext.user!.companyId,
      },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    const token = await this.auth.getToken();
    const hashedToken = await this.auth.hashToken(token);

    const user = await this.userRepository.save(
      this.userRepository.create({
        email,
        roleId: role.id,
        password: '',
        companyId: this.requestContext.user!.companyId,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: moment().add(24, 'hours').toDate(),
        profile: {
          firstName: '',
          lastName: '',
          companyRole: '',
        },
      }),
    );

    const event = new UserCreatedEvent(this.requestContext.user!, user, {
      pre: null,
      post: user,
      token,
    });

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userSuccessMessages.createdUser,
      new GetUserResponseDTO(user),
    );
  }

  async listUsers({ limit, page }: PaginationParameters, filters?: any) {
    const totalUsers = await this.userRepository.count({
      where: { companyId: this.requestContext.user!.companyId, ...filters },
    });

    const users = await this.userRepository.find({
      where: { companyId: this.requestContext.user!.companyId, ...filters },
      relations: { profile: true, role: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // TODO emit event

    return ResponseFormatter.success(
      userSuccessMessages.fetchedUsers,
      users.map((user) => new GetUserResponseDTO(user)),
      new ResponseMetaDTO({
        totalNumberOfRecords: totalUsers,
        totalNumberOfPages: Math.ceil(totalUsers / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async getUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id, companyId: this.requestContext.user!.companyId },
      relations: { profile: true, role: true },
    });

    if (!user) {
      throw new IBadRequestException({
        message: userErrors.userNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      userSuccessMessages.fetchedUser,
      new GetUserResponseDTO(user),
    );
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

    if (user.id === this.requestContext.user!.id) {
      throw new IBadRequestException({
        message: userErrors.cannotUpdateSelf,
      });
    }

    let role;
    if (roleId) {
      role = await this.roleRepository.findOne({
        where: {
          id: roleId,
          parentId: this.requestContext.user!.role.parentId,
          companyId: this.requestContext.user!.companyId,
        },
      });

      if (!role) {
        throw new IBadRequestException({
          message: roleErrors.roleNotFound,
        });
      }
    }

    const updatedUser = this.userRepository.create({
      roleId: role?.id,
      status,
    });

    const updatedProfile = this.profileRepository.create({
      firstName,
      lastName,
    });

    await this.userRepository.update({ id: user.id }, updatedUser);
    await this.profileRepository.update(
      { id: user.profile!.id },
      updatedProfile,
    );
    updatedUser.profile = updatedProfile;

    const event = new UserUpdatedEvent(this.requestContext.user!, user, {
      pre: user,
      post: updatedUser,
    });

    if (updatedUser.status && user.status !== updatedUser.status) {
      if (updatedUser.status === UserStatuses.ACTIVE) {
        const event = new UserReactivatedEvent(this.requestContext.user!, user);
        this.eventEmitter.emit(event.name, event);
      }
      if (updatedUser.status === UserStatuses.INACTIVE) {
        const event = new UserDeactivatedEvent(this.requestContext.user!, user);
        this.eventEmitter.emit(event.name, event);
      }
    }

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userSuccessMessages.updatedUser,
      new GetUserResponseDTO(updatedUser),
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

    if (user.id === this.requestContext.user!.id) {
      throw new IBadRequestException({
        message: userErrors.cannotDeleteSelf,
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

  async getStats() {
    const stats = await this.userRepository.query(
      `SELECT IFNULL(count, 0) count, definitions.value FROM definitions
              LEFT OUTER JOIN (
              SELECT count(id) AS count, status
              FROM users WHERE deleted_at IS NULL AND company_id = ?
              GROUP BY status
            ) users ON users.status = definitions.value
              AND definitions.type = 'status'
              WHERE definitions.entity = 'user'
        `,
      [this.requestContext.user!.companyId],
    );
    return ResponseFormatter.success(
      userSuccessMessages.fetchedUsersStats,
      stats,
    );
  }
}
