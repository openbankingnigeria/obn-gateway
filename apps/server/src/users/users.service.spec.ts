import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '@users/users.service';
import {
  UserBuilder,
  RoleBuilder,
  ProfileBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { userSuccessMessages } from '@users/user.constants';
import { userErrors } from '@users/user.errors';
import { UserStatuses, RoleStatuses } from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Auth } from '@common/utils/authentication/auth.helper';
import {
  User,
  Role,
  Profile,
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
import { Equal, IsNull } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;
  let roleRepository: MockRepository<Role>;
  let profileRepository: MockRepository<Profile>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let auth: jest.Mocked<Pick<Auth, 'getToken' | 'hashToken'>>;
  let ctx: RequestContext;

  beforeEach(async () => {
    // Simple context setup - createMockContext handles the complexity
    ctx = createMockContext({
      permissions: [PERMISSIONS.ADD_TEAM_MEMBERS],
    }).ctx;

    // Only mock repositories that are actually used
    userRepository = {
      ...createMockRepository<User>(),
      count: jest.fn(),
      find: jest.fn(),
      query: jest.fn(),
    } as any;

    roleRepository = {
      ...createMockRepository<Role>(),
      findOne: jest.fn(),
    } as any;

    profileRepository = {
      ...createMockRepository<Profile>(),
    } as any;
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
    it('should throw BadRequest error if email already exists', async () => {
      const email = 'exists@example.com';
      const createDto: CreateUserDto = {
        email,
        roleId: 'valid-role-id',
      };

      userRepository.count.mockResolvedValue(1);

      await expect(service.createUser(ctx, createDto)).rejects.toThrow(
        IBadRequestException,
      );

      // Verify email check is system-wide (no company filter)
      expect(userRepository.count).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(userRepository.count).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error for invalid role', async () => {
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: 'invalid-role-id',
      };

      userRepository.count.mockResolvedValue(0); 
      roleRepository.findOne.mockResolvedValue(null);

      await expect(service.createUser(ctx, createDto)).rejects.toThrow(
        IBadRequestException,
      );

      // Verify role validation checks company, parentId, status, and global roles
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: [
          expect.objectContaining({
            id: Equal(createDto.roleId),
            parentId: Equal(ctx.activeUser.role.parentId),
            companyId: Equal(ctx.activeUser.companyId),
            status: RoleStatuses.ACTIVE,
          }),
          expect.objectContaining({
            id: Equal(createDto.roleId),
            parentId: Equal(ctx.activeUser.role.parentId),
            companyId: IsNull(), 
            status: RoleStatuses.ACTIVE,
          }),
        ],
      });
      expect(roleRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should create user with blank password and hashed reset token', async () => {
      const role = new RoleBuilder()
        .with('status', RoleStatuses.ACTIVE)
        .with('companyId', ctx.activeUser.companyId!)
        .with('parentId', ctx.activeUser.role.parentId)
        .build();

      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);
      userRepository.save.mockResolvedValue(new UserBuilder().build());

      await service.createUser(ctx, createDto);

      // Verify auth services called for token generation
      expect(auth.getToken).toHaveBeenCalledWith();
      expect(auth.getToken).toHaveBeenCalledTimes(1);
      expect(auth.hashToken).toHaveBeenCalledWith('test-token');
      expect(auth.hashToken).toHaveBeenCalledTimes(1);

      // Verify user creation with correct password and token details
      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          email: createDto.email,
          roleId: role.id,
          password: '', // Blank password
          companyId: ctx.activeUser.companyId,
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: expect.any(Date), 
        }),
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);

      // Verify token expires in approximately 24 hours
      const saveCall = userRepository.save.mock.calls[0][0];
      const expiryDate = saveCall.resetPasswordExpires;
      const expectedExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const timeDiff = Math.abs((expiryDate as Date).getTime() - expectedExpiry.getTime());
      expect(timeDiff).toBeLessThan(60 * 1000); 
    });

    it('should initialize profile with empty values', async () => {
      const role = new RoleBuilder().build();
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);
      userRepository.save.mockResolvedValue(new UserBuilder().build());

      await service.createUser(ctx, createDto);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: {
            firstName: '',
            lastName: '',
            companyRole: '',
          },
        }),
      );
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should emit UserCreatedEvent with invite token', async () => {
      const role = new RoleBuilder().build();
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      const mockUser = new UserBuilder()
        .with('email', createDto.email)
        .with('roleId', role.id!)
        .build();

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);
      userRepository.save.mockResolvedValue(mockUser);

      await service.createUser(ctx, createDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.objectContaining({
          name: 'user.created',
          author: ctx.activeUser,
          user: mockUser,
          metadata: expect.objectContaining({
            token: 'test-token', 
            pre: null,
            post: mockUser,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should return created user in standardized DTO format', async () => {
      const role = new RoleBuilder().build();
      const createDto: CreateUserDto = {
        email: 'test@example.com',
        roleId: role.id!,
      };

      const mockUser = new UserBuilder()
        .with('email', createDto.email)
        .with('roleId', role.id!)
        .with('companyId', ctx.activeUser.companyId!)
        .with('role', role)
        .with('profile', new ProfileBuilder().build())
        .with('status', UserStatuses.PENDING)
        .build();

      userRepository.count.mockResolvedValue(0);
      roleRepository.findOne.mockResolvedValue(role);
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(ctx, createDto);

      expect(result).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.createdUser,
          expect.objectContaining({
            id: mockUser.id,
            email: mockUser.email,
            roleId: mockUser.roleId,
            companyId: mockUser.companyId,
            status: mockUser.status,
            profile: expect.objectContaining({
              firstName: mockUser.profile?.firstName,
              lastName: mockUser.profile?.lastName,
              companyRole: mockUser.profile?.companyRole,
            }),
          }),
        ),
      );
    });
  });

  describe('listUsers', () => {
    it('should return users from same company with profile and role details', async () => {
      const role = new RoleBuilder().with('name', 'Admin').build();
      const profile = new ProfileBuilder()
        .with('firstName', 'John')
        .with('lastName', 'Doe')
        .build();
      const users = [
        new UserBuilder()
          .with('profile', profile)
          .with('role', role)
          .with('companyId', ctx.activeUser.companyId!)
          .build(),
      ];

      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue(users);

      const result = await service.listUsers(ctx, { page: 1, limit: 10 });

      // Verify company filter is applied
      expect(userRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: expect.objectContaining({
              _type: 'equal',
              _value: ctx.activeUser.companyId,
            }),
          }),
          relations: expect.objectContaining({
            profile: true,
            role: true,
          }),
        }),
      );
      expect(userRepository.find).toHaveBeenCalledTimes(1);

      // Verify response includes profile and role details
      expect(result.status).toBe('success');
      expect(result.data).toHaveLength(1);
      expect(result.data![0]).toMatchObject({
        companyId: ctx.activeUser.companyId,
        profile: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
        }),
        role: expect.objectContaining({
          name: 'Admin',
        }),
      });
    });

    it('should support pagination with correct metadata', async () => {
      const users = [new UserBuilder().build()];
      userRepository.count.mockResolvedValue(25);
      userRepository.find.mockResolvedValue(users);

      const result = await service.listUsers(ctx, { page: 2, limit: 5 });

      // Verify pagination parameters
      expect(userRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, 
          take: 5,
        }),
      );
      expect(userRepository.find).toHaveBeenCalledTimes(1);

      // Verify pagination metadata
      expect(result.meta).toMatchObject({
        totalNumberOfRecords: 25,
        totalNumberOfPages: 5, 
        pageNumber: 2,
        pageSize: 5,
      });
    });

    it('should support filtering by email, status, roleId, createdAt, name, and phone', async () => {
      const role = new RoleBuilder().build();
      const users = [new UserBuilder().build()];
      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue(users);

      await service.listUsers(
        ctx,
        { page: 1, limit: 10 },
        {
          email: 'test@example.com',
          status: UserStatuses.ACTIVE,
          roleId: role.id!,
          createdAt: new Date('2024-01-01'),
          name: 'John',
          phone: '+1234567890',
        }
      );

      expect(userRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            email: 'test@example.com',
            status: UserStatuses.ACTIVE,
            roleId: role.id,
            createdAt: new Date('2024-01-01'),
            name: 'John',
            phone: '+1234567890',
            companyId: expect.objectContaining({
              _type: 'equal',
              _value: ctx.activeUser.companyId,
            }),
          }),
        }),
      );
      expect(userRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return standardized DTO format on success', async () => {
      const users = [
        new UserBuilder()
          .with('profile', new ProfileBuilder().build())
          .with('role', new RoleBuilder().build())
          .build(),
      ];

      userRepository.count.mockResolvedValue(1);
      userRepository.find.mockResolvedValue(users);

      const result = await service.listUsers(ctx, { page: 1, limit: 10 });

      expect(result).toEqual(
        expect.objectContaining({
          status: 'success',
          message: expect.any(String),
          data: expect.any(Array),
          meta: expect.objectContaining({
            totalNumberOfRecords: expect.any(Number),
            totalNumberOfPages: expect.any(Number),
            pageNumber: expect.any(Number),
            pageSize: expect.any(Number),
          }),
        }),
      );
    });
  });

  describe('getUser', () => {
    it('should return user with profile and role details from same company', async () => {
      const role = new RoleBuilder()
        .with('name', 'Admin')
        .build();
      const profile = new ProfileBuilder()
        .with('firstName', 'John')
        .with('lastName', 'Doe')
        .build();
      const user = new UserBuilder()
        .with('companyId', ctx.activeUser.companyId!)
        .with('profile', profile)
        .with('role', role)
        .build();

      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getUser(ctx, user.id!);
      
      // Verify company filter is applied
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: expect.objectContaining({
            _type: 'equal',
            _value: user.id,
          }),
          companyId: expect.objectContaining({
            _type: 'equal',
            _value: ctx.activeUser.companyId,
          }),
        }),
        relations: expect.objectContaining({
          profile: true,
          role: true,
        }),
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);

      // Verify standardized response format with complete details
      expect(result).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.fetchedUser,
          expect.objectContaining({
            id: user.id,
            email: user.email,
            companyId: user.companyId,
            profile: expect.objectContaining({
              firstName: profile.firstName,
              lastName: profile.lastName,
            }),
            role: expect.objectContaining({
              id: role.id,
              name: role.name,
            }),
          }),
        ),
      );
    });

    it('should throw NotFound error if user does not exist', async () => {
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

    it('should throw NotFound error for users from different companies', async () => {
      const differentCompanyUserId = 'different-company-user-id';
      
      // Repository returns null when user belongs to different company due to company filter
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUser(ctx, differentCompanyUserId)).rejects.toThrow(
        INotFoundException,
      );

      // Verify repository was called with company filter
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: expect.objectContaining({
            _type: 'equal',
            _value: differentCompanyUserId,
          }),
          companyId: expect.objectContaining({
            _type: 'equal',
            _value: ctx.activeUser.companyId,
          }),
        }),
        relations: expect.objectContaining({
          profile: true,
          role: true,
        }),
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('should throw NotFound error for users from different companies', async () => {
      const differentCompanyUserId = 'different-company-user-id';
      const updateDto: Partial<UpdateUserDto> = {
        firstName: 'Updated',
        lastName: 'User',
        status: UserStatuses.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUser(ctx, differentCompanyUserId, updateDto as UpdateUserDto),
      ).rejects.toThrow(INotFoundException);

      // Verify repository called with company filter
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: expect.objectContaining({
            _type: 'equal',
            _value: differentCompanyUserId,
          }),
          companyId: expect.objectContaining({
            _type: 'equal',
            _value: ctx.activeUser.companyId,
          }),
        }),
        relations: expect.objectContaining({
          profile: true,
        }),
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when trying to update self', async () => {
      const currentUser = ctx.activeUser;
      const updateDto: Partial<UpdateUserDto> = {
        firstName: 'Updated',
        lastName: 'User',
        status: UserStatuses.ACTIVE,
      };
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(
        service.updateUser(ctx, currentUser.id!, updateDto as UpdateUserDto),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw BadRequest error when trying to deactivate self', async () => {
      const currentUser = ctx.activeUser;
      const updateDto: Partial<UpdateUserDto> = {
        firstName: 'Updated',
        lastName: 'User',
        status: UserStatuses.INACTIVE,
      };
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(
        service.updateUser(ctx, currentUser.id!, updateDto as UpdateUserDto),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw BadRequest error for invalid roleId', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .build();
      const updateDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        roleId: 'invalid-role-id',
        status: UserStatuses.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(user);
      roleRepository.findOne.mockResolvedValue(null); 

      await expect(
        service.updateUser(ctx, user.id!, updateDto),
      ).rejects.toThrow(IBadRequestException);

      // Verify role validation checks company, parentId, status, and global roles
      expect(roleRepository.findOne).toHaveBeenCalledWith({
        where: [
          expect.objectContaining({
            id: Equal(updateDto.roleId),
            parentId: Equal(ctx.activeUser.role.parentId),
            companyId: Equal(ctx.activeUser.companyId),
            status: RoleStatuses.ACTIVE,
          }),
          expect.objectContaining({
            id: Equal(updateDto.roleId),
            parentId: Equal(ctx.activeUser.role.parentId),
            companyId: IsNull(), 
            status: RoleStatuses.ACTIVE,
          }),
        ],
      });
      expect(roleRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should update user status, role, firstName, and lastName', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .with('status', UserStatuses.PENDING)
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

      await service.updateUser(ctx, user.id!, updateDto);

      // Verify user fields are updated
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: user.id },
        expect.objectContaining({
          roleId: newRole.id,
          status: updateDto.status,
        }),
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);

      // Verify profile fields are updated
      expect(profileRepository.update).toHaveBeenCalledWith(
        { id: user.profile!.id },
        expect.objectContaining({
          firstName: updateDto.firstName,
          lastName: updateDto.lastName,
        }),
      );
      expect(profileRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should emit UserReactivatedEvent when status changes to ACTIVE', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .with('status', UserStatuses.INACTIVE)
        .build();
      const updateDto: Partial<UpdateUserDto> = {
        status: UserStatuses.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateUser(ctx, user.id!, updateDto as UpdateUserDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.reactivated',
        expect.objectContaining({
          name: 'user.reactivated',
          author: ctx.activeUser,
          user: expect.objectContaining({
            id: user.id,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });

    it('should emit UserDeactivatedEvent when status changes to INACTIVE', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .with('status', UserStatuses.ACTIVE)
        .build();
      const updateDto: Partial<UpdateUserDto> = {
        status: UserStatuses.INACTIVE,
      };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateUser(ctx, user.id!, updateDto as UpdateUserDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.deactivated',
        expect.objectContaining({
          name: 'user.deactivated',
          author: ctx.activeUser,
          user: expect.objectContaining({
            id: user.id,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);
    });

    it('should always emit UserUpdatedEvent and return updated user in standardized DTO format', async () => {
      const user = new UserBuilder()
        .with('profile', new ProfileBuilder().build())
        .with('companyId', ctx.activeUser.companyId!)
        .build();
      const updateDto: Partial<UpdateUserDto> = {
        firstName: 'Updated',
        lastName: 'User',
        status: UserStatuses.ACTIVE,
      };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateUser(ctx, user.id!, updateDto as UpdateUserDto);

      // Verify UserUpdatedEvent is emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.updated',
        expect.objectContaining({
          name: 'user.updated',
          author: ctx.activeUser,
          user: expect.objectContaining({
            id: user.id,
          }),
          metadata: expect.objectContaining({
            pre: user,
            post: expect.any(Object),
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2);

      // Verify standardized DTO format response
      expect(result).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.updatedUser,
          expect.objectContaining({
            profile: expect.objectContaining({
              firstName: updateDto.firstName,
              lastName: updateDto.lastName,
            }),
            status: updateDto.status,
          }),
        ),
      );
    });
  });

  describe('getStats', () => {
    it('should return count of users by status for acting user company', async () => {
      const mockStats = [
        { count: 5, value: UserStatuses.ACTIVE },
        { count: 2, value: UserStatuses.PENDING },
        { count: 0, value: UserStatuses.INACTIVE },
      ];
      userRepository.query.mockResolvedValue(mockStats);

      const result = await service.getStats(ctx);

      // Verify query filters by company
      expect(userRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('AND users.company_id = ?'),
        [ctx.activeUser.companyId],
      );
      expect(userRepository.query).toHaveBeenCalledTimes(1);

      // Verify response includes stats for all statuses
      expect(result).toEqual(
        ResponseFormatter.success(
          userSuccessMessages.fetchedUsersStats,
          mockStats.map((stat) => new GetStatsResponseDTO(stat)),
        ),
      );

      // Verify all user statuses are included, even with zero count
      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ count: 5, value: UserStatuses.ACTIVE }),
          expect.objectContaining({ count: 2, value: UserStatuses.PENDING }),
          expect.objectContaining({ count: 0, value: UserStatuses.INACTIVE }),
        ]),
      );
    });

    it('should include all statuses even when no users exist', async () => {
      const mockStats = [
        { count: 0, value: UserStatuses.ACTIVE },
        { count: 0, value: UserStatuses.PENDING },
        { count: 0, value: UserStatuses.INACTIVE },
      ];
      userRepository.query.mockResolvedValue(mockStats);

      const result = await service.getStats(ctx);

      // Verify all statuses are returned with zero counts
      expect(result.data).toHaveLength(3);
      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ count: 0, value: UserStatuses.ACTIVE }),
          expect.objectContaining({ count: 0, value: UserStatuses.PENDING }),
          expect.objectContaining({ count: 0, value: UserStatuses.INACTIVE }),
        ]),
      );
    });
  });

  describe('deleteUser', () => {
    it('should throw NotFound error for users from different companies', async () => {
      const differentCompanyUserId = 'different-company-user-id';
      
      userRepository.findOne.mockResolvedValue(null); 

      await expect(service.deleteUser(ctx, differentCompanyUserId)).rejects.toThrow(
        INotFoundException,
      );

      // Verify repository called with company filter
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: expect.objectContaining({
            _type: 'equal',
            _value: differentCompanyUserId,
          }),
          companyId: expect.objectContaining({
            _type: 'equal',
            _value: ctx.activeUser.companyId,
          }),
        }),
      });
      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when trying to delete self', async () => {
      const currentUser = ctx.activeUser;
      userRepository.findOne.mockResolvedValue(currentUser);

      await expect(service.deleteUser(ctx, currentUser.id!)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should soft delete user and emit UserDeletedEvent', async () => {
      const user = new UserBuilder()
        .with('companyId', ctx.activeUser.companyId!)
        .build();

      userRepository.findOne.mockResolvedValue(user);
      userRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteUser(ctx, user.id!);

      // Verify soft delete is used (not permanent deletion)
      expect(userRepository.softDelete).toHaveBeenCalledWith({ id: user.id });
      expect(userRepository.softDelete).toHaveBeenCalledTimes(1);

      // Verify UserDeletedEvent is emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.deleted',
        expect.objectContaining({
          name: 'user.deleted',
          author: ctx.activeUser,
          user: user,
          metadata: expect.objectContaining({
            pre: user,
            post: null,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should return standardized success message on successful deletion', async () => {
      const user = new UserBuilder()
        .with('companyId', ctx.activeUser.companyId!)
        .build();

      userRepository.findOne.mockResolvedValue(user);
      userRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteUser(ctx, user.id!);

      expect(result).toEqual(
        ResponseFormatter.success(userSuccessMessages.deletedUser, null),
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
      userRepository.update = jest
        .fn()
        .mockResolvedValue({ affected: 1 } as any);

      const result = await service.resendInvite(ctx, user.id!);
      const mockRes = createMockResponse();
      mockRes.json(result);

      // auth was called to get and hash token
      expect(auth.getToken).toHaveBeenCalledWith();
      expect(auth.getToken).toHaveBeenCalledTimes(1);
      expect(auth.hashToken).toHaveBeenCalledWith('test-token');
      expect(auth.hashToken).toHaveBeenCalledTimes(1);

      // repository updated with hashed token and expiry (about 24 hours)
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: user.id },
        expect.objectContaining({
          resetPasswordToken: 'hashed-token',
          resetPasswordExpires: expect.any(Date),
        })
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      const updateArgs = (userRepository.update as jest.Mock).mock.calls[0][1];
      expect(updateArgs.resetPasswordToken).toBe('hashed-token');
      expect(updateArgs.resetPasswordExpires).toBeInstanceOf(Date);
      const diff = Math.abs(
        updateArgs.resetPasswordExpires.getTime() -
          Date.now() -
          24 * 60 * 60 * 1000,
      );
      // expiry should be within 1 minute of 24 hours from now
      expect(diff).toBeLessThan(60 * 1000);

      // event emitted and should include the raw token in metadata
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.objectContaining({
          metadata: expect.objectContaining({
            token: 'test-token',
          }),
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

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
        .json(
          ResponseFormatter.error(userErrors.cannotResendInvite(user.status!)),
        );

      expect(mockRes.body).toEqual(
        ResponseFormatter.error(userErrors.cannotResendInvite(user.status!)),
      );
    });
  });
});
