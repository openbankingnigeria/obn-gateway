import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { Profile, User, TwoFaBackupCode } from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { profileSuccessMessages } from './profile.constants';
import { userErrors } from '@users/user.errors';
import { GetProfileResponseDTO } from './dto/index.dto';
import {
  IBadRequestException,
} from '@common/utils/exceptions/exceptions';
import { Equal } from 'typeorm';
import {
  ProfileBuilder,
  UserBuilder,
  RoleBuilder,
  CompanyBuilder,
  PermissionBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import {
  createMockContext,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { PERMISSIONS } from '@permissions/types';

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: MockRepository<Profile>;
  let userRepository: MockRepository<User>;
  let backupCodesRepository: MockRepository<TwoFaBackupCode>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let ctx: RequestContext;

  beforeEach(async () => {
    // Create test data with proper user context
    const testUser = new UserBuilder()
      .with('id', 'test-user-id')
      .with('company', new CompanyBuilder().build())
      .with('role', new RoleBuilder().build())
      .build();

    ctx = createMockContext({
      user: testUser,
      permissions: [PERMISSIONS.VIEW_PROFILE],
    }).ctx;

    // Initialize all repository mocks with clean state
    profileRepository = createMockRepository<Profile>();
    userRepository = createMockRepository<User>();
    backupCodesRepository = createMockRepository<TwoFaBackupCode>();

    eventEmitter = mockEventEmitter();

    // Create testing module with all dependencies injected
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: 'ProfileRepository', useValue: profileRepository },
        { provide: 'UserRepository', useValue: userRepository },
        { provide: 'TwoFaBackupCodeRepository', useValue: backupCodesRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return authenticated user profile successfully with complete details', async () => {
      const mockRole = new RoleBuilder()
        .with('id', 'role-id')
        .with('name', 'Admin')
        .with('permissions', [
          new PermissionBuilder().with('name', 'READ_USERS').build(),
          new PermissionBuilder().with('name', 'WRITE_USERS').build(),
        ])
        .build();

      const mockUser = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('role', mockRole)
        .build();

      const mockProfile = new ProfileBuilder()
        .with('id', 'profile-id')
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'John')
        .with('lastName', 'Doe')
        .with('companyRole', 'Software Engineer')
        .with('phone', '+1234567890')
        .with('country', 'Nigeria')
        .with('user', mockUser)
        .with('createdAt', new Date('2024-01-01'))
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(ctx);

      // Verify repository called with correct parameters including relations
      expect(profileRepository.findOne).toHaveBeenCalledWith({
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
      expect(profileRepository.findOne).toHaveBeenCalledTimes(1);

      // Verify response format and success message
      expect(result).toEqual(
        ResponseFormatter.success(
          profileSuccessMessages.fetchedProfile,
          new GetProfileResponseDTO(mockProfile),
        ),
      );

      // Verify all profile details are included in response
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 'profile-id',
          firstName: 'John',
          lastName: 'Doe',
          companyRole: 'Software Engineer',
          phone: '+1234567890',
          country: 'Nigeria',
          user: expect.objectContaining({
            id: ctx.activeUser.id,
            email: 'test@example.com',
            role: expect.objectContaining({
              id: 'role-id',
              name: 'Admin',
              permissions: expect.arrayContaining([
                expect.objectContaining({ name: 'READ_USERS' }),
                expect.objectContaining({ name: 'WRITE_USERS' }),
              ]),
            }),
          }),
          createdAt: new Date('2024-01-01'),
        }),
      );
    });

    it('should only return the authenticated user profile (scoped to current user)', async () => {
      const authenticatedUserId = ctx.activeUser.id!;
      const mockProfile = new ProfileBuilder()
        .with('userId', authenticatedUserId)
        .with('user', new UserBuilder().with('id', authenticatedUserId).build())
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      await service.getProfile(ctx);

      // Verify the query filters by the authenticated user's ID only
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: Equal(authenticatedUserId) },
        relations: {
          user: {
            role: {
              permissions: true,
              parent: true,
            },
          },
        },
      });
      expect(profileRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when profile does not exist', async () => {
      profileRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile(ctx)).rejects.toThrow(
        IBadRequestException,
      );

      // Verify repository was called with correct parameters
      expect(profileRepository.findOne).toHaveBeenCalledWith({
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
      expect(profileRepository.findOne).toHaveBeenCalledTimes(1);

      // Verify the correct error message is used
      try {
        await service.getProfile(ctx);
      } catch (error: any) {
        expect(error.message).toBe(userErrors.userNotFound);
      }
    });

    it('should include user role and permissions in the response', async () => {
      const mockPermissions = [
        new PermissionBuilder().with('name', 'VIEW_DASHBOARD').build(),
        new PermissionBuilder().with('name', 'MANAGE_USERS').build(),
        new PermissionBuilder().with('name', 'VIEW_REPORTS').build(),
      ];

      const mockParentRole = new RoleBuilder()
        .with('id', 'parent-role-id')
        .with('name', 'Super Admin')
        .build();

      const mockRole = new RoleBuilder()
        .with('permissions', mockPermissions)
        .with('parent', mockParentRole)
        .build();

      const mockUser = new UserBuilder()
        .with('role', mockRole)
        .build();

      const mockProfile = new ProfileBuilder()
        .with('user', mockUser)
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(ctx);

      // Verify role details are included
      expect(result.data!.user.role).toEqual(
        expect.objectContaining({
          permissions: expect.arrayContaining([
            expect.objectContaining({ name: 'VIEW_DASHBOARD' }),
            expect.objectContaining({ name: 'MANAGE_USERS' }),
            expect.objectContaining({ name: 'VIEW_REPORTS' }),
          ]),
          parent: expect.objectContaining({
            id: 'parent-role-id',
            name: 'Super Admin',
          }),
        }),
      );
    });

    it('should return profile with empty optional fields when not set', async () => {
      const mockProfile = new ProfileBuilder()
        .with('firstName', 'John')
        .with('lastName', 'Doe')
        .with('companyRole', '')
        .with('phone', undefined)
        .with('country', undefined)
        .with('user', new UserBuilder().build())
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(ctx);

      expect(result.data).toEqual(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          companyRole: '',
          phone: undefined,
          country: undefined,
        }),
      );
    });

    it('should handle profile with minimal user role information', async () => {
      const mockRole = new RoleBuilder()
        .with('permissions', [])
        .with('parent', undefined)
        .build();

      const mockUser = new UserBuilder()
        .with('role', mockRole)
        .build();

      const mockProfile = new ProfileBuilder()
        .with('user', mockUser)
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(ctx);

      expect(result.data!.user.role).toEqual(
        expect.objectContaining({
          permissions: [],
          parent: undefined,
        }),
      );
    });

    it('should return standardized success response format', async () => {
      const mockProfile = new ProfileBuilder()
        .with('user', new UserBuilder().build())
        .build();

      profileRepository.findOne.mockResolvedValue(mockProfile);

      const result = await service.getProfile(ctx);

      // Verify standardized response structure
      expect(result).toEqual(
        expect.objectContaining({
          status: 'success',
          message: profileSuccessMessages.fetchedProfile,
          data: expect.any(Object),
        }),
      );

      // Verify data is properly formatted as DTO
      expect(result.data).toBeInstanceOf(GetProfileResponseDTO);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
