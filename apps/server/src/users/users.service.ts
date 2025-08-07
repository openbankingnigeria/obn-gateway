import { Injectable } from '@nestjs/common';
import {
  CreateUserDto,
  GetStatsResponseDTO,
  GetUserResponseDTO,
  UpdateUserDto,
} from './dto/index.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Profile,
  Role,
  RoleStatuses,
  User,
  UserStatuses,
} from '@common/database/entities';
import { Equal, IsNull, Repository } from 'typeorm';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { userErrors } from '@users/user.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserCreatedEvent,
  UserDeactivatedEvent,
  UserDeletedEvent,
  UserUpdatedEvent,
  UserReactivatedEvent,
} from 'src/shared/events/user.event';
import { Auth } from '@common/utils/authentication/auth.helper';
import moment from 'moment';
import { userSuccessMessages } from '@users/user.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly eventEmitter: EventEmitter2,
    private readonly auth: Auth,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async createUser(ctx: RequestContext, data: CreateUserDto) {
    const { email, roleId } = data;

    const userExists = await this.userRepository.count({
      where: { email },
    });

    if (userExists) {
      throw new IBadRequestException({
        message: userErrors.userWithEmailAlreadyExists(data.email),
      });
    }

    const where = {
      id: Equal(roleId),
      parentId: Equal(ctx.activeUser.role.parentId),
      companyId: Equal(ctx.activeUser.companyId),
      deletedAt: IsNull(),
      status: RoleStatuses.ACTIVE,
    };

    const role = await this.roleRepository.findOne({
      where: [where, { ...where, companyId: IsNull() }],
    });

    if (!role) {
      throw new IBadRequestException({
        message: userErrors.invalidRole,
      });
    }

    const token = await this.auth.getToken();
    const hashedToken = await this.auth.hashToken(token);

    const user = await this.userRepository.save(
      this.userRepository.create({
        email,
        roleId: role.id,
        password: '',
        companyId: ctx.activeUser.companyId,
        resetPasswordToken: hashedToken,
        resetPasswordExpires: moment().add(24, 'hours').toDate(),
        profile: {
          firstName: '',
          lastName: '',
          companyRole: '',
        },
      }),
    );

    const event = new UserCreatedEvent(ctx.activeUser, user, {
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

  async resendInvite(ctx: RequestContext, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: Equal(id), companyId: Equal(ctx.activeUser.companyId) },
    });

    if (!user) {
      throw new INotFoundException({
        message: userErrors.userNotFound,
      });
    }

    if (user.status !== UserStatuses.PENDING) {
      throw new IBadRequestException({
        message: userErrors.cannotResendInvite(user.status!),
      });
    }

    const token = await this.auth.getToken();
    const hashedToken = await this.auth.hashToken(token);

    await this.userRepository.update(
      { id: user.id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: moment().add(24, 'hours').toDate(),
      },
    );

    const event = new UserCreatedEvent(ctx.activeUser, user, {
      pre: null,
      post: user,
      token,
    });

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userSuccessMessages.sentInvite,
      new GetUserResponseDTO(user),
    );
  }

  async listUsers(
    ctx: RequestContext,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const where = {
      ...filters,
      companyId: Equal(ctx.activeUser.companyId),
    };

    const totalUsers = await this.userRepository.count({
      where,
    });

    const users = await this.userRepository.find({
      where,
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

  async getUser(ctx: RequestContext, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: Equal(id), companyId: Equal(ctx.activeUser.companyId) },
      relations: { profile: true, role: true },
    });

    if (!user) {
      throw new INotFoundException({
        message: userErrors.userNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      userSuccessMessages.fetchedUser,
      new GetUserResponseDTO(user),
    );
  }

  async updateUser(ctx: RequestContext, id: string, data: UpdateUserDto) {
    const { firstName, lastName, status, roleId } = data;

    const user = await this.userRepository.findOne({
      where: { id: Equal(id), companyId: Equal(ctx.activeUser.companyId) },
      relations: { profile: true },
    });

    if (!user) {
      throw new INotFoundException({
        message: userErrors.userNotFound,
      });
    }

    if (user.id === ctx.activeUser.id) {
      if (status === UserStatuses.INACTIVE && user.status !== status) {
        throw new IBadRequestException({
          message: userErrors.cannotDeactivateSelf,
        });
      }
      throw new IBadRequestException({
        message: userErrors.cannotUpdateSelf,
      });
    }

    let role;
    if (roleId) {
      const where = {
        id: Equal(roleId),
        parentId: Equal(ctx.activeUser.role.parentId),
        companyId: Equal(ctx.activeUser.companyId),
        deletedAt: IsNull(),
        status: RoleStatuses.ACTIVE,
      };
      role = await this.roleRepository.findOne({
        where: [where, { ...where, companyId: IsNull() }],
      });

      if (!role) {
        throw new IBadRequestException({
          message: userErrors.invalidRole,
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

    const event = new UserUpdatedEvent(ctx.activeUser, user, {
      pre: user,
      post: updatedUser,
    });

    if (updatedUser.status && user.status !== updatedUser.status) {
      if (updatedUser.status === UserStatuses.ACTIVE) {
        const event = new UserReactivatedEvent(ctx.activeUser, user);
        this.eventEmitter.emit(event.name, event);
      }
      if (updatedUser.status === UserStatuses.INACTIVE) {
        const event = new UserDeactivatedEvent(ctx.activeUser, user);
        this.eventEmitter.emit(event.name, event);
      }
    }

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      userSuccessMessages.updatedUser,
      new GetUserResponseDTO(updatedUser),
    );
  }

  async deleteUser(ctx: RequestContext, id: string) {
    const user = await this.userRepository.findOne({
      where: { id: Equal(id), companyId: Equal(ctx.activeUser.companyId) },
    });

    if (!user) {
      throw new INotFoundException({
        message: userErrors.userNotFound,
      });
    }

    if (user.id === ctx.activeUser.id) {
      throw new IBadRequestException({
        message: userErrors.cannotDeleteSelf,
      });
    }

    await this.userRepository.softDelete({ id: user.id });

    const event = new UserDeletedEvent(ctx.activeUser, user, {
      pre: user,
      post: null,
    });

    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(userSuccessMessages.deletedUser, null);
  }

  async getStats(ctx: RequestContext) {
    const stats = await this.userRepository.query(
      `SELECT IFNULL(count(users.id), 0) count, definitions.value
    FROM
      users
      RIGHT OUTER JOIN (${Object.values(UserStatuses)
        .map((status) => `SELECT '${status}' AS \`key\`, '${status}' AS value`)
        .join(' UNION ')}) definitions ON users.status = definitions.key
        AND users.deleted_at IS NULL
        AND users.company_id = ?
    GROUP BY
      definitions.value
        `,
      [ctx.activeUser.companyId],
    );
    return ResponseFormatter.success(
      userSuccessMessages.fetchedUsersStats,
      stats.map(
        (stat: { count: number; value: string }) =>
          new GetStatsResponseDTO(stat),
      ),
    );
  }
}
