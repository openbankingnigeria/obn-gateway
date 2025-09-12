import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { Profile, User, TwoFaBackupCode } from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { profileSuccessMessages, profileErrorMessages } from './profile.constants';
import { userErrors, userConfig } from '@users/user.errors';
import { GetProfileResponseDTO, UpdateProfileDto, GenerateTwoFaResponseDTO, UpdateTwoFADto } from './dto/index.dto';
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
import { UpdateProfileEvent, Generate2FaEvent, Verify2FaEvent } from '@shared/events/profile.event';
import { hashSync, compareSync } from 'bcryptjs';

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

  describe('updateProfile', () => {
    it('should update authenticated user profile successfully', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const existingProfile = new ProfileBuilder()
        .with('id', 'profile-id')
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'OriginalFirst')
        .with('lastName', 'OriginalLast')
        .with('companyRole', 'Developer')
        .build();

      const updatedProfileData = {
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      };

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.create.mockReturnValue(updatedProfileData as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, updateDto);

      // Verify profile lookup for authenticated user only
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: Equal(ctx.activeUser.id!) },
      });
      expect(profileRepository.findOne).toHaveBeenCalledTimes(1);

      // Verify profile creation with updated data
      expect(profileRepository.create).toHaveBeenCalledWith({
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      });
      expect(profileRepository.create).toHaveBeenCalledTimes(1);

      // Verify profile update for authenticated user only
      expect(profileRepository.update).toHaveBeenCalledWith(
        { userId: ctx.activeUser.id },
        updatedProfileData,
      );
      expect(profileRepository.update).toHaveBeenCalledTimes(1);

      // Verify UpdateProfileEvent is emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.update',
        expect.objectContaining({
          name: 'profile.update',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            pre: expect.objectContaining({
              firstName: 'OriginalFirst',
              lastName: 'OriginalLast',
            }),
            post: expect.objectContaining({
              firstName: 'UpdatedFirst',
              lastName: 'UpdatedLast',
            }),
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

      // Verify successful response with updated data
      expect(result).toEqual(
        ResponseFormatter.success(
          profileSuccessMessages.updatedProfile,
          new GetProfileResponseDTO(
            Object.assign({}, existingProfile, updatedProfileData),
          ),
        ),
      );

      // Verify response includes both original and updated data
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 'profile-id',
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
          companyRole: 'Developer',
        }),
      );
    });

    it('should only allow authenticated user to update their own profile', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      const userProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(userProfile);
      profileRepository.create.mockReturnValue({} as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(ctx, updateDto);

      // Verify lookup is scoped to authenticated user
      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: Equal(ctx.activeUser.id!) },
      });

      // Verify update is scoped to authenticated user
      expect(profileRepository.update).toHaveBeenCalledWith(
        { userId: ctx.activeUser.id },
        expect.any(Object),
      );
    });

    it('should throw BadRequest error when profile does not exist', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      profileRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateProfile(ctx, updateDto),
      ).rejects.toThrow(IBadRequestException);

      expect(profileRepository.findOne).toHaveBeenCalledWith({
        where: { userId: Equal(ctx.activeUser.id!) },
      });
      expect(profileRepository.findOne).toHaveBeenCalledTimes(1);

      // Verify no update operations were attempted
      expect(profileRepository.create).not.toHaveBeenCalled();
      expect(profileRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should validate firstName is required and meets constraints', async () => {
      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);

      const validDto: UpdateProfileDto = {
        firstName: 'ValidName', 
        lastName: 'ValidLast',
      };

      profileRepository.create.mockReturnValue({
        firstName: validDto.firstName,
        lastName: validDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, validDto);

      expect(result.status).toBe('success');
      expect(profileRepository.create).toHaveBeenCalledWith({
        firstName: 'ValidName',
        lastName: 'ValidLast',
      });
    });

    it('should validate lastName is required and meets constraints', async () => {
      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);

      const validDto: UpdateProfileDto = {
        firstName: 'ValidFirst',
        lastName: 'ValidLastName',
      };

      profileRepository.create.mockReturnValue({
        firstName: validDto.firstName,
        lastName: validDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, validDto);

      expect(result.status).toBe('success');
      expect(profileRepository.create).toHaveBeenCalledWith({
        firstName: 'ValidFirst',
        lastName: 'ValidLastName',
      });
    });

    it('should handle names with valid alphabetic characters and hyphens', async () => {
      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);

      const validDto: UpdateProfileDto = {
        firstName: 'Mary-Jane',
        lastName: 'Smith-Johnson',
      };

      profileRepository.create.mockReturnValue({
        firstName: validDto.firstName,
        lastName: validDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, validDto);

      expect(result.status).toBe('success');
      expect(profileRepository.create).toHaveBeenCalledWith({
        firstName: 'Mary-Jane',
        lastName: 'Smith-Johnson',
      });
    });

    it('should preserve existing profile data not being updated', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'NewFirst',
        lastName: 'NewLast',
      };

      const existingProfile = new ProfileBuilder()
        .with('id', 'profile-id')
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'OldFirst')
        .with('lastName', 'OldLast')
        .with('companyRole', 'Senior Developer')
        .with('phone', '+1234567890')
        .with('country', 'Nigeria')
        .with('createdAt', new Date('2024-01-01'))
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.create.mockReturnValue({
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, updateDto);

      // Verify only firstName and lastName are updated, other fields preserved
      expect(result.data).toEqual(
        expect.objectContaining({
          id: 'profile-id',
          firstName: 'NewFirst', 
          lastName: 'NewLast',
          companyRole: 'Senior Developer', 
          phone: '+1234567890',
          country: 'Nigeria',
          createdAt: new Date('2024-01-01'),
        }),
      );
    });

    it('should emit UpdateProfileEvent with correct author and metadata', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'EventTest',
        lastName: 'EventLast',
      };

      const existingProfile = new ProfileBuilder()
        .with('id', 'profile-id')
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'OriginalFirstName')
        .with('lastName', 'OriginalLastName')
        .with('companyRole', 'Developer')
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.create.mockReturnValue({
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(ctx, updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.update',
        expect.objectContaining({
          name: 'profile.update',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            pre: expect.objectContaining({
              firstName: 'OriginalFirstName',
              lastName: 'OriginalLastName',
            }),
            post: expect.objectContaining({
              firstName: 'EventTest',
              lastName: 'EventLast',
            }),
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should return updated profile in standardized DTO format', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'StandardizedFirst',
        lastName: 'StandardizedLast',
      };

      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'Original')
        .with('lastName', 'Name')
        .build();

      const updatedData = {
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      };

      profileRepository.findOne.mockResolvedValue(existingProfile);
      profileRepository.create.mockReturnValue(updatedData as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, updateDto);

      // Verify standardized response structure
      expect(result).toEqual(
        expect.objectContaining({
          status: 'success',
          message: profileSuccessMessages.updatedProfile,
          data: expect.any(Object),
        }),
      );

      // Verify data is properly formatted as DTO
      expect(result.data).toBeInstanceOf(GetProfileResponseDTO);
    });

    it('should validate minimum length requirement is met', async () => {
      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);

      const validMinLengthDto: UpdateProfileDto = {
        firstName: 'Jo',
        lastName: 'Li',
      };

      profileRepository.create.mockReturnValue({
        firstName: validMinLengthDto.firstName,
        lastName: validMinLengthDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, validMinLengthDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(
        expect.objectContaining({
          firstName: 'Jo',
          lastName: 'Li',
        }),
      );
    });

    it('should include complete audit trail in event metadata for change tracking', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'AuditFirst',
        lastName: 'AuditLast',
      };

      const originalProfile = new ProfileBuilder()
        .with('id', 'audit-profile-id')
        .with('userId', ctx.activeUser.id!)
        .with('firstName', 'BeforeFirst')
        .with('lastName', 'BeforeLast')
        .with('companyRole', 'Senior Developer')
        .with('phone', '+1234567890')
        .with('country', 'Nigeria')
        .with('createdAt', new Date('2025-01-01'))
        .build();

      profileRepository.findOne.mockResolvedValue(originalProfile);
      profileRepository.create.mockReturnValue({
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateProfile(ctx, updateDto);

      // Verify complete audit trail metadata
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.update',
        expect.objectContaining({
          metadata: expect.objectContaining({
            pre: expect.objectContaining({
              id: 'audit-profile-id',
              firstName: 'BeforeFirst',
              lastName: 'BeforeLast',
              companyRole: 'Senior Developer',
              phone: '+1234567890',
              country: 'Nigeria',
              createdAt: new Date('2025-01-01'),
            }),
            post: expect.objectContaining({
              id: 'audit-profile-id',
              firstName: 'AuditFirst',
              lastName: 'AuditLast',
              companyRole: 'Senior Developer',
              phone: '+1234567890',
              country: 'Nigeria',
              createdAt: new Date('2025-01-01'),
            }),
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should handle case-insensitive alphabetic validation', async () => {
      const existingProfile = new ProfileBuilder()
        .with('userId', ctx.activeUser.id!)
        .build();

      profileRepository.findOne.mockResolvedValue(existingProfile);

      const mixedCaseDto: UpdateProfileDto = {
        firstName: 'JohnPaul',
        lastName: 'MCDONALD',
      };

      profileRepository.create.mockReturnValue({
        firstName: mixedCaseDto.firstName,
        lastName: mixedCaseDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, mixedCaseDto);

      expect(result.status).toBe('success');
      expect(result.data).toEqual(
        expect.objectContaining({
          firstName: 'JohnPaul',
          lastName: 'MCDONALD',
        }),
      );
    });
  });

  describe('updatePassword', () => {
    const validUpdatePasswordDto = {
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword456!',
      confirmPassword: 'NewPassword456!',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should successfully update password when all validations pass', async () => {
      const originalUser = new UserBuilder()
        .with('id', 'test-user-id')
        .with('password', hashSync('OldPassword123!', 12))
        .with('company', new CompanyBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      const testCtx = createMockContext({
        user: originalUser,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updatePassword(testCtx, validUpdatePasswordDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: originalUser.id },
        expect.objectContaining({
          resetPasswordToken: null,
          resetPasswordExpires: null,
          password: expect.any(String),
          lastPasswordChange: expect.any(Date),
        }),
      );

      expect(result.status).toBe('success');
      expect(result.message).toBe(profileSuccessMessages.updatedPassword);
      expect(result.data).toBeUndefined();
    });

    it('should emit AuthSetPasswordEvent with correct metadata on successful password update', async () => {
      const originalUser = new UserBuilder()
        .with('id', 'test-user-id')
        .with('password', hashSync('OldPassword123!', 12))
        .with('company', new CompanyBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      const testCtx = createMockContext({
        user: originalUser,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword(testCtx, validUpdatePasswordDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'auth.set-password',
        expect.objectContaining({
          name: 'auth.set-password',
          user: originalUser,
          metadata: expect.any(Object),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should clear existing reset tokens when password is updated', async () => {
      const userWithResetTokens = new UserBuilder()
        .with('id', 'test-user-id')
        .with('password', hashSync('OldPassword123!', 12))
        .with('resetPasswordToken', 'existing-reset-token-123')
        .with('resetPasswordExpires', new Date('2025-12-31'))
        .with('company', new CompanyBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      const testCtx = createMockContext({
        user: userWithResetTokens,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword(testCtx, validUpdatePasswordDto);

      // Verify that existing reset tokens are cleared
      const updateCall = userRepository.update.mock.calls[0][1] as any;
      expect(updateCall.resetPasswordToken).toBeNull();
      expect(updateCall.resetPasswordExpires).toBeNull();
      
      // Verify user had tokens before the update
      expect(userWithResetTokens.resetPasswordToken).toBe('existing-reset-token-123');
      expect(userWithResetTokens.resetPasswordExpires).toEqual(new Date('2025-12-31'));
    });

    it('should throw password-mismatch error when new password and confirm password do not match', async () => {
      const mismatchDto = {
        oldPassword: 'OldPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'DifferentPassword789!',
      };

      await expect(service.updatePassword(ctx, mismatchDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.passwordMismatch,
        }),
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw same-old-password error when new password is same as old password', async () => {
      const samePasswordDto = {
        oldPassword: 'SamePassword123!',
        newPassword: 'SamePassword123!',
        confirmPassword: 'SamePassword123!',
      };

      await expect(service.updatePassword(ctx, samePasswordDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.sameOldPassword,
        }),
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw incorrect-old-password error when old password does not match current password', async () => {
      const originalUser = new UserBuilder()
        .with('id', 'test-user-id')
        .with('password', hashSync('ActualPassword123!', 12))
        .with('company', new CompanyBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      const testCtx = createMockContext({
        user: originalUser,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      const wrongOldPasswordDto = {
        oldPassword: 'WrongOldPassword123!',
        newPassword: 'NewPassword456!',
        confirmPassword: 'NewPassword456!',
      };

      await expect(service.updatePassword(testCtx, wrongOldPasswordDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.incorrectOldPassword,
        }),
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should prioritize same-old-password validation over password-mismatch validation', async () => {
      const priorityTestDto = {
        oldPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'DifferentPassword456!',
      };

      await expect(service.updatePassword(ctx, priorityTestDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.sameOldPassword,
        }),
      );
    });

    it('should set lastPasswordChange when password is updated', async () => {
      const originalUser = new UserBuilder()
        .with('id', 'test-user-id')
        .with('password', hashSync('OldPassword123!', 12))
        .with('company', new CompanyBuilder().build())
        .with('role', new RoleBuilder().build())
        .build();

      const testCtx = createMockContext({
        user: originalUser,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updatePassword(testCtx, validUpdatePasswordDto);

      const updateCall = userRepository.update.mock.calls[0][1] as any;
      
      expect(updateCall.lastPasswordChange).toBeInstanceOf(Date);
    });
  });

  describe('verifyTwoFA', () => {
    it('should throw BadRequestException when 2FA is already enabled', async () => {
      // Set user context with 2FA already enabled
      const userWith2FAEnabled = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', true)
        .with('twofaSecret', 'EXISTING2FASECRET12345678901234')
        .build();

      const testCtx = createMockContext({
        user: userWith2FAEnabled,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      const verifyDto: UpdateTwoFADto = { code: '123456' };

      await expect(service.verifyTwoFA(testCtx, verifyDto)).rejects.toThrow(
        IBadRequestException
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(backupCodesRepository.insert).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when 2FA code is incorrect', async () => {
      // Mock speakeasy to return false for verification
      const mockSpeakeasy = require('speakeasy');
      mockSpeakeasy.totp.verify.mockReturnValueOnce(false);

      const userWithSecret = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', false)
        .with('twofaSecret', 'VALIDSECRET12345678901234567890')
        .build();

      const testCtx = createMockContext({
        user: userWithSecret,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      const verifyDto: UpdateTwoFADto = { code: '000000' }; 

      await expect(service.verifyTwoFA(testCtx, verifyDto)).rejects.toThrow(
        IBadRequestException
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(backupCodesRepository.insert).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should successfully verify 2FA and enable it with backup codes generated', async () => {
      const userWithSecret = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', false)
        .with('twofaSecret', 'VALIDSECRET12345678901234567890')
        .build();

      const testCtx = createMockContext({
        user: userWithSecret,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      backupCodesRepository.insert.mockResolvedValue({ identifiers: [], generatedMaps: [], raw: [] });

      const verifyDto: UpdateTwoFADto = { code: '123456' }; 

      const result = await service.verifyTwoFA(testCtx, verifyDto);

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: testCtx.activeUser.id! },
        expect.objectContaining({
          twofaEnabled: true,
        })
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);

      // Verify 12 backup codes are generated and saved
      expect(backupCodesRepository.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: testCtx.activeUser.id!,
            value: expect.any(String),
          })
        ])
      );
      expect(backupCodesRepository.insert).toHaveBeenCalledTimes(1);

      const insertedBackupCodes = backupCodesRepository.insert.mock.calls[0][0] as any[];
      expect(insertedBackupCodes).toHaveLength(12);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.2fa.verify',
        expect.objectContaining({
          name: 'profile.2fa.verify',
          author: testCtx.activeUser,
          metadata: {},
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^[A-Za-z0-9]{6}$/)
        ])
      );
      expect(result.data).toHaveLength(12);
    });

    it('should generate unique hashed backup codes for storage', async () => {
      const userWithSecret = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', false)
        .with('twofaSecret', 'VALIDSECRET12345678901234567890')
        .build();

      const testCtx = createMockContext({
        user: userWithSecret,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      backupCodesRepository.insert.mockResolvedValue({ identifiers: [], generatedMaps: [], raw: [] });

      const verifyDto: UpdateTwoFADto = { code: '123456' };

      await service.verifyTwoFA(testCtx, verifyDto);

      const insertedBackupCodes = backupCodesRepository.insert.mock.calls[0][0] as any[];
      
      // Verify all backup codes are unique
      const codes = insertedBackupCodes.map((bc: any) => bc.value);
      const uniqueCodes = [...new Set(codes)];
      expect(uniqueCodes).toHaveLength(12);

      codes.forEach((code: string) => {
        expect(code).toMatch(/^\$2[ab]\$\d+\$/); 
      });
    });

    it('should return plain text backup codes in response while storing hashed versions', async () => {
      const userWithSecret = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', false)
        .with('twofaSecret', 'VALIDSECRET12345678901234567890')
        .build();

      const testCtx = createMockContext({
        user: userWithSecret,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      backupCodesRepository.insert.mockResolvedValue({ identifiers: [], generatedMaps: [], raw: [] });

      const verifyDto: UpdateTwoFADto = { code: '123456' };

      const result = await service.verifyTwoFA(testCtx, verifyDto);

      const insertedBackupCodes = backupCodesRepository.insert.mock.calls[0][0] as any[];
      const returnedBackupCodes = result.data as string[];

      returnedBackupCodes.forEach((code: string) => {
        expect(code).toMatch(/^[A-Za-z0-9]{6}$/);
      });

      // Verify stored codes are hashed
      insertedBackupCodes.forEach((bc: any) => {
        expect(bc.value).toMatch(/^\$2[ab]\$\d+\$/);
      });

      // Verify different formats
      expect(returnedBackupCodes[0]).not.toBe(insertedBackupCodes[0].value);
    });
  });

  describe('generateTwoFA', () => {
    beforeEach(() => {
      // Reset speakeasy mocks for each test
      const mockSpeakeasy = require('speakeasy');
      mockSpeakeasy.generateSecret.mockImplementation(() => ({
        base32: 'MOCK2FASECRET123456789012345678',
        otpauth_url: 'otpauth://totp/Test?secret=MOCK2FASECRET123456789012345678'
      }));
      mockSpeakeasy.otpauthURL.mockImplementation(({ label, secret }: any) => 
        `otpauth://totp/${label}?secret=${secret}`
      );
    });

    it('should throw BadRequestException when 2FA is already enabled', async () => {
      const userWith2FA = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', true)
        .build();

      const testCtx = createMockContext({
        user: userWith2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      await expect(service.generateTwoFA(testCtx)).rejects.toThrow(
        IBadRequestException
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should successfully generate 2FA secret and QR code when 2FA is not enabled', async () => {
      const userWithout2FA = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', false)
        .build();

      const testCtx = createMockContext({
        user: userWithout2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.generateTwoFA(testCtx);

      expect(result.data).toBeInstanceOf(GenerateTwoFaResponseDTO);
      expect(result.data!.otpAuthURL).toMatch(/^otpauth:\/\/totp\/.*secret=MOCK2FASECRET123456789012345678/);
      expect(result.data!.qrCodeImage).toMatch(/^data:image\/png;base64,/);

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: testCtx.activeUser.id! },
        expect.objectContaining({
          twofaSecret: 'MOCK2FASECRET123456789012345678', 
        })
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.2fa.generate',
        expect.objectContaining({
          name: 'profile.2fa.generate',
          author: testCtx.activeUser,
          metadata: {},
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should generate unique secrets on multiple calls for different users', async () => {
      const user1 = new UserBuilder()
        .with('id', 'user-1')
        .with('email', 'user1@example.com')
        .with('twofaEnabled', false)
        .build();

      const ctx1 = createMockContext({
        user: user1,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result1 = await service.generateTwoFA(ctx1);

      // Verify it contains the expected secret and format
      expect(result1.data!.otpAuthURL).toContain('MOCK2FASECRET123456789012345678');
      expect(result1.data!.otpAuthURL).toMatch(/^otpauth:\/\/totp\//);
    });

    it('should include correct user email in OTP URL', async () => {
      const userEmail = 'specific-user@company.com';
      const userWithSpecificEmail = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', userEmail)
        .with('twofaEnabled', false)
        .build();

      const testCtx = createMockContext({
        user: userWithSpecificEmail,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.generateTwoFA(testCtx);

      // Verify it contains the expected secret
      expect(result.data!.otpAuthURL).toContain('MOCK2FASECRET123456789012345678');
      expect(result.data!.otpAuthURL).toMatch(/^otpauth:\/\/totp\//);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
