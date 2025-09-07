import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@users/users.service';
import {
  UserBuilder,
  RoleBuilder,
  ProfileBuilder,
  CompanyBuilder,
  RolePermissionBuilder,
  PermissionBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { userSuccessMessages } from '@users/user.constants';
import { userErrors } from '@users/user.errors';
import { UserStatuses, CompanyStatuses } from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Auth } from '@common/utils/authentication/auth.helper';
import {
  User,
  Role,
  Profile,
  Company,
  RolePermission,
  Permission,
} from '@common/database/entities';
import { RequestContext } from '@common/utils/request/request-context';
import {
  CreateUserDto,
  UpdateUserDto,
  GetStatsResponseDTO,
} from '@users/dto/index.dto';
import {
  createMockContext,
  createMockResponse,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { PERMISSIONS } from '@permissions/types';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { Equal } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let roleRepository: MockRepository<Role>;
  let profileRepository: MockRepository<Profile>;
  let companyRepository: MockRepository<Company>;
  let rolePermissionRepository: MockRepository<RolePermission>;
  let permissionRepository: MockRepository<Permission>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let auth: jest.Mocked<Pick<Auth, 'getToken' | 'hashToken'>>;
  let ctx: RequestContext;

  beforeEach(async () => {
    const rolePermissions = [
      new RolePermissionBuilder()
        .with('role', new RoleBuilder().build())
        .with('permission', new PermissionBuilder().build())
        .build(),
      new RolePermissionBuilder()
        .with('role', new RoleBuilder().build())
        .with('permission', new PermissionBuilder().build())
        .build(),
    ];
    const permission = new PermissionBuilder()
      .with('roles', rolePermissions)
      .build();

    const role = new RoleBuilder().with('permissions', [permission]).build();
    const company = new CompanyBuilder()
      .with('status', CompanyStatuses.ACTIVE)
      .build();
    const user = new UserBuilder()
      .with('role', role)
      .with('company', company)
      .with('profile', new ProfileBuilder().build())
      .build();

    ctx = createMockContext({
      user,
      permissions: [PERMISSIONS.ADD_TEAM_MEMBERS],
    }).ctx;

    userRepository = {
      ...createMockRepository<User>(),
      count: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
      })),
    } as any;

    roleRepository = {
      ...createMockRepository<Role>(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      })),
    } as any;

    profileRepository = {
      ...createMockRepository<Profile>(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        setParameter: jest.fn().mockReturnThis(),
      })) as any,
    };

    companyRepository = createMockRepository<Company>();
    rolePermissionRepository = createMockRepository<RolePermission>();
    permissionRepository = createMockRepository<Permission>();
    eventEmitter = mockEventEmitter();
    auth = {
      getToken: jest.fn().mockResolvedValue('test-token'),
      hashToken: jest.fn().mockResolvedValue('hashed-token'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: 'UserRepository', useValue: userRepository },
        { provide: 'RoleRepository', useValue: roleRepository },
        { provide: 'ProfileRepository', useValue: profileRepository },
        { provide: 'CompanyRepository', useValue: companyRepository },
        {
          provide: 'RolePermissionRepository',
          useValue: rolePermissionRepository,
        },
        { provide: 'PermissionRepository', useValue: permissionRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: Auth, useValue: auth },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should successfully create a user with valid DTO', async () => {
      const role = new RoleBuilder().build();
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);

      const mockUser = new UserBuilder()
        .with('email', createDto.email)
        .with('roleId', role.id!)
        .with('companyId', ctx.activeUser.companyId!)
        .with('role', role)
        .with('profile', new ProfileBuilder().build())
        .build();

      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(ctx, createDto);
      const mockRes = createMockResponse<User>();
      mockRes.json(result);

      expect(mockRes.body).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.createdUser,
          expect.objectContaining({
            email: createDto.email,
            roleId: role.id,
            profile: expect.any(Object),
          }),
        ),
      );
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw if email already exists', async () => {
      const email = 'exists@example.com';
      const createDto: CreateUserDto = {
        email,
        roleId: 'valid-role-id',
      };

      userRepository.count.mockResolvedValue(1);

      await expect(service.createUser(ctx, createDto)).rejects.toThrow(
        IBadRequestException,
      );

      const mockRes = createMockResponse();
      mockRes
        .status(400)
        .json(
          ResponseFormatter.error(userErrors.userWithEmailAlreadyExists(email)),
        );

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.userWithEmailAlreadyExists(email)),
      );
    });

    it('should throw if role is invalid', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: 'invalid-role-id',
      };

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.createUser(ctx, createDto)).rejects.toThrow(
        IBadRequestException,
      );

      const mockRes = createMockResponse();
      mockRes.status(400).json(ResponseFormatter.error(userErrors.invalidRole));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.invalidRole),
      );
    });

    it('should include company in the created user', async () => {
      const role = new RoleBuilder().build();
      const company = new CompanyBuilder().build();
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);
      companyRepository.findOne.mockResolvedValue(company);

      const mockUser = new UserBuilder()
        .with('email', createDto.email)
        .with('roleId', role.id!)
        .with('companyId', company.id!)
        .with('company', company)
        .with('profile', new ProfileBuilder().build())
        .build();

      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(ctx, createDto);
      const mockRes = createMockResponse<User>();
      mockRes.json(result);

      expect(mockRes.body.data).toMatchObject({
        company: { id: company.id },
      });
    });
  });

  describe('listUsers', () => {
    it('should return paginated user response', async () => {
      const users = [
        new UserBuilder().with('profile', new ProfileBuilder().build()).build(),
        new UserBuilder().with('profile', new ProfileBuilder().build()).build(),
      ];

      userRepository.count.mockResolvedValue(2);
      userRepository.find.mockResolvedValue(users);

      const result = await service.listUsers(ctx, { page: 1, limit: 10 });
      const mockRes = createMockResponse<User[]>();
      mockRes.json(result);

      expect(mockRes.body.status).toBe('success');
      expect(mockRes.body.data).toHaveLength(2);
      mockRes.body.data!.forEach((user) => {
        expect(user).toHaveProperty('profile');
      });
    });

    it('should return empty array when no users exist', async () => {
      userRepository.count.mockResolvedValue(0);
      userRepository.find.mockResolvedValue([]);

      const result = await service.listUsers(ctx, { page: 1, limit: 10 });
      const mockRes = createMockResponse<User[]>();
      mockRes.json(result);

      expect(mockRes.body.data).toHaveLength(0);
    });

    it('should filter users by company when user is not super admin', async () => {
      const users = [
        new UserBuilder()
          .with('companyId', ctx.activeUser.companyId!)
          .with('profile', new ProfileBuilder().build())
          .build(),
      ];

      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue(users);

      const result = await service.listUsers(ctx, { page: 1, limit: 10 });
      const mockRes = createMockResponse<User[]>();
      mockRes.json(result);

      expect(mockRes.body.data).toHaveLength(1);
      expect(mockRes.body.data![0]).toMatchObject({
        companyId: ctx.activeUser.companyId,
      });
    });
  });

  describe('getUser', () => {
    it('should return valid user response', async () => {
      const user = new UserBuilder()
        .with('companyId', ctx.activeUser.companyId!)
        .with('profile', new ProfileBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getUser(ctx, user.id!);
      const mockRes = createMockResponse<User>();
      mockRes.json(result);

      expect(mockRes.body).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.fetchedUser,
          expect.objectContaining({
            id: user.id,
            email: user.email,
            profile: expect.objectContaining({
              firstName: user.profile?.firstName,
            }),
          }),
        ),
      );
    });

    it('should throw 404 for non-existent user', async () => {
      const invalidId = 'invalid-id';
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUser(ctx, invalidId)).rejects.toThrow(
        INotFoundException,
      );

      const mockRes = createMockResponse();
      mockRes
        .status(404)
        .json(ResponseFormatter.error(userErrors.userNotFound));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.userNotFound),
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const profile = new ProfileBuilder().build();
      const user = new UserBuilder()
        .with('profile', profile)
        .with('companyId', ctx.activeUser.companyId!)
        .build();
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: user.roleId!,
        status: UserStatuses.ACTIVE,
      };
      const role = new RoleBuilder().build();

      userRepository.findOne.mockResolvedValue(user);
      roleRepository.findOne.mockResolvedValue(role);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateUser(ctx, user.id!, updateDto);
      const mockRes = createMockResponse<User>();
      mockRes.json(result);

      expect(mockRes.body).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.updatedUser,
          expect.objectContaining({
            profile: {
              firstName: updateDto.firstName,
              lastName: updateDto.lastName,
            },
            status: updateDto.status,
          }),
        ),
      );
      expect(userRepository.update).toHaveBeenCalled();
      expect(profileRepository.update).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw when trying to update non-existent user', async () => {
      const invalidId = 'invalid-id';
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: 'valid-role-id',
        status: UserStatuses.ACTIVE,
      };
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser(ctx, invalidId, updateDto),
      ).rejects.toThrow(INotFoundException);

      const mockRes = createMockResponse();
      mockRes
        .status(404)
        .json(ResponseFormatter.error(userErrors.userNotFound));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.userNotFound),
      );
    });

    it('should throw when trying to update self', async () => {
      const currentUser = ctx.activeUser;
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: currentUser.roleId!,
        status: UserStatuses.ACTIVE,
      };
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(
        service.updateUser(ctx, currentUser.id!, updateDto),
      ).rejects.toThrow(IBadRequestException);

      const mockRes = createMockResponse();
      mockRes
        .status(400)
        .json(ResponseFormatter.error(userErrors.cannotUpdateSelf));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.cannotUpdateSelf),
      );
    });

    it('should throw when trying to deactivate self', async () => {
      const currentUser = ctx.activeUser;
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: currentUser.roleId!,
        status: UserStatuses.INACTIVE,
      };
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(
        service.updateUser(ctx, currentUser.id!, updateDto),
      ).rejects.toThrow(IBadRequestException);

      const mockRes = createMockResponse();
      mockRes
        .status(400)
        .json(ResponseFormatter.error(userErrors.cannotDeactivateSelf));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.cannotDeactivateSelf),
      );
    });

    it('should update user role when roleId is provided', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .build();
      const newRole = new RoleBuilder().build();
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: newRole.id!,
        status: UserStatuses.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(user);
      roleRepository.findOne.mockResolvedValue(newRole);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateUser(ctx, user.id!, updateDto);
      const mockRes = createMockResponse<User>();
      mockRes.json(result);

      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({ id: Equal(newRole.id!) }),
        ]),
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: user.id },
        expect.objectContaining({ roleId: newRole.id }),
      );
    });
  });

  describe('getStats', () => {
    it('should return valid stats response', async () => {
      const mockStats = [
        { count: 5, value: UserStatuses.ACTIVE },
        { count: 2, value: UserStatuses.PENDING },
      ];
      userRepository.query.mockResolvedValue(mockStats);

      const result = await service.getStats(ctx);
      const mockRes = createMockResponse<GetStatsResponseDTO[]>();
      mockRes.json(result);

      expect(mockRes.body).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.fetchedUsersStats,
          mockStats.map((stat) => new GetStatsResponseDTO(stat)),
        ),
      );
      expect(userRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('AND users.company_id = ?'),
        [ctx.activeUser.companyId],
      );
    });

    it('should return empty array when no stats available', async () => {
      userRepository.query.mockResolvedValue([]);

      const result = await service.getStats(ctx);
      const mockRes = createMockResponse<GetStatsResponseDTO[]>();
      mockRes.json(result);

      expect(mockRes.body.data).toHaveLength(0);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      const user = new UserBuilder()
        .with('companyId', ctx.activeUser.companyId!)
        .build();

      userRepository.findOne.mockResolvedValue(user);
      userRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteUser(ctx, user.id!);
      const mockRes = createMockResponse();
      mockRes.json(result);

      expect(mockRes.body).toEqual(
        ResponseFormatter.success(userSuccessMessages.deletedUser, null),
      );
      expect(userRepository.softDelete).toHaveBeenCalledWith({ id: user.id });
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw when trying to delete non-existent user', async () => {
      const invalidId = 'invalid-id';
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteUser(ctx, invalidId)).rejects.toThrow(
        INotFoundException,
      );

      const mockRes = createMockResponse();
      mockRes
        .status(404)
        .json(ResponseFormatter.error(userErrors.userNotFound));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.userNotFound),
      );
    });

    it('should throw when trying to delete self', async () => {
      const currentUser = ctx.activeUser;
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(service.deleteUser(ctx, currentUser.id!)).rejects.toThrow(
        IBadRequestException,
      );

      const mockRes = createMockResponse();
      mockRes
        .status(400)
        .json(ResponseFormatter.error(userErrors.cannotDeleteSelf));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.cannotDeleteSelf),
      );
    });
  });

  describe('Resend Invite', () => {
    it('should throw NotFoundException if user does not exist or belong to the same company', async () => {
      const userId = 'non-existent-user-id';
      userRepository.findOne.mockResolvedValue(null);

      const mockRes = createMockResponse();
      mockRes
        .status(404)
        .json(ResponseFormatter.error(userErrors.userNotFound));

      await expect(service.resendInvite(ctx, userId)).rejects.toThrow(
        INotFoundException,
      );
      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.userNotFound),
      );
    });

    it('should resend invite for a pending user and update reset token + emit event', async () => {
      const user = new UserBuilder()
        .with('status', UserStatuses.PENDING)
        .with('companyId', ctx.activeUser.companyId!)
        .build();

      userRepository.findOne.mockResolvedValue(user);
      userRepository.update = jest.fn().mockResolvedValue({ affected: 1 } as any);

      const result = await service.resendInvite(ctx, user.id!);
      const mockRes = createMockResponse();
      mockRes.json(result);

      // auth was called to get and hash token
      expect(auth.getToken).toHaveBeenCalled();
      expect(auth.hashToken).toHaveBeenCalledWith('test-token');

      // repository updated with hashed token and expiry
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: user.id },
        expect.objectContaining({
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: expect.any(Date),
        }),
      );

      // event emitted
      expect(eventEmitter.emit).toHaveBeenCalled();

      // response should be a success with sentInvite message
      expect(mockRes.body).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.sentInvite,
          expect.objectContaining({ id: user.id }),
        ),
      );
    });

    it('should throw BadRequestException when user status is not PENDING', async () => {
      const user = new UserBuilder()
        .with('status', UserStatuses.ACTIVE)
        .with('companyId', ctx.activeUser.companyId!)
        .build();

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.resendInvite(ctx, user.id!)).rejects.toThrow(
        IBadRequestException,
      );

      const mockRes = createMockResponse();
      mockRes
        .status(400)
        .json(ResponseFormatter.error(userErrors.cannotResendInvite(user.status!)));

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.cannotResendInvite(user.status!)),
      );
    });
  });
});
