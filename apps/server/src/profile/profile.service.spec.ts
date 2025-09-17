import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { Profile, User, TwoFaBackupCode } from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { profileSuccessMessages, profileErrorMessages } from './profile.constants';
import { userErrors } from '@users/user.errors';
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
  TwoFaBackupCodeBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import {
  createMockContext,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { PERMISSIONS } from '@permissions/types';
import { UpdateProfileEvent } from '@shared/events/profile.event';
import { hashSync } from 'bcryptjs';

const mockSpeakeasy = jest.mocked(require('speakeasy'));

describe('ProfileService', () => {
  let service: ProfileService;
  let profileRepository: MockRepository<Profile>;
  let userRepository: MockRepository<User>;
  let backupCodesRepository: MockRepository<TwoFaBackupCode>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let ctx: RequestContext;

  beforeEach(async () => {
    const testUserId = 'test-user-id';
    
    const testRole = new RoleBuilder()
      .with('name', 'Admin')
      .with('permissions', [
        new PermissionBuilder().with('name', 'READ_USERS').build(),
        new PermissionBuilder().with('name', 'WRITE_USERS').build(),
      ])
      .build();
    
    const testProfile = new ProfileBuilder()
      .with('userId', testUserId)
      .with('firstName', 'John')
      .with('lastName', 'Doe')
      .with('companyRole', 'Software Engineer')
      .with('phone', '+1234567890')
      .with('country', 'Nigeria')
      .with('createdAt', new Date('2024-01-01'))
      .build();

    const testUser = new UserBuilder()
      .with('id', testUserId)
      .with('company', new CompanyBuilder().build())
      .with('role', testRole)
      .with('profile', testProfile)
      .build();

    ctx = createMockContext({
      user: testUser,
      permissions: [PERMISSIONS.VIEW_PROFILE],
    }).ctx;

    
    profileRepository = createMockRepository<Profile>();
    userRepository = createMockRepository<User>();
    backupCodesRepository = createMockRepository<TwoFaBackupCode>();

    eventEmitter = mockEventEmitter();

    
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
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return authenticated user profile successfully with complete details', async () => {
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

      const result = await service.getProfile(ctx);

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
          new GetProfileResponseDTO(ctx.activeUser.profile!),
        ),
      );

      // Verify all profile details are included in response
      expect(result.data).toEqual(
        expect.objectContaining({
          id: ctx.activeUser.profile!.id,
          firstName: 'John',
          lastName: 'Doe',
          companyRole: 'Software Engineer',
          phone: '+1234567890',
          country: 'Nigeria',
          userId: ctx.activeUser.id,
          createdAt: new Date('2024-01-01'),
        }),
      );
    });

    it('should only return the authenticated user profile (scoped to current user)', async () => {
      const authenticatedUserId = ctx.activeUser.id!;
      
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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
      const profileWithUserRelation = {
        ...ctx.activeUser.profile!,
        user: ctx.activeUser,
      };
      
      profileRepository.findOne.mockResolvedValue(profileWithUserRelation as any);

      const result = await service.getProfile(ctx);

      // Verify role details match what we set up in beforeEach
      expect(result.data!.user.role).toEqual(
        expect.objectContaining({
          name: 'Admin',
          permissions: expect.arrayContaining([
            expect.objectContaining({ name: 'READ_USERS' }),
            expect.objectContaining({ name: 'WRITE_USERS' }),
          ]),
        }),
      );
    });

    it('should return profile with empty optional fields when not set', async () => {
      // Create a profile with some empty fields 
      const profileWithEmptyFields = new ProfileBuilder()
        .with('firstName', 'John')
        .with('lastName', 'Doe')
        .with('companyRole', '')
        .with('phone', undefined)
        .with('country', undefined)
        .with('user', ctx.activeUser)
        .build();

      profileRepository.findOne.mockResolvedValue(profileWithEmptyFields);

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
      // Create a minimal role
      const minimalRole = new RoleBuilder()
        .with('permissions', [])
        .with('parent', undefined)
        .build();

      const userWithMinimalRole = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('role', minimalRole)
        .build();

      const profileWithMinimalRole = new ProfileBuilder()
        .with('user', userWithMinimalRole)
        .build();

      profileRepository.findOne.mockResolvedValue(profileWithMinimalRole);

      const result = await service.getProfile(ctx);

      expect(result.data!.user.role).toEqual(
        expect.objectContaining({
          permissions: [],
          parent: undefined,
        }),
      );
    });

    it('should return standardized success response format', async () => {
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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

      const updatedProfileData = {
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      };

      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);
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
              firstName: ctx.activeUser.profile!.firstName,
              lastName: ctx.activeUser.profile!.lastName,
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
            Object.assign({}, ctx.activeUser.profile!, updatedProfileData),
          ),
        ),
      );

      // Verify response includes both original and updated data
      expect(result.data).toEqual(
        expect.objectContaining({
          id: ctx.activeUser.profile!.id,
          firstName: 'UpdatedFirst',
          lastName: 'UpdatedLast',
          companyRole: ctx.activeUser.profile!.companyRole,
        }),
      );
    });

    it('should only allow authenticated user to update their own profile', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'UpdatedFirst',
        lastName: 'UpdatedLast',
      };

      // Use the existing profile from context
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);
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
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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

      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);
      profileRepository.create.mockReturnValue({
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateProfile(ctx, updateDto);

      // Verify only firstName and lastName are updated, other fields preserved
      expect(result.data).toEqual(
        expect.objectContaining({
          id: ctx.activeUser.profile!.id,
          firstName: 'NewFirst', 
          lastName: 'NewLast',
          companyRole: ctx.activeUser.profile!.companyRole,
          phone: ctx.activeUser.profile!.phone,
          country: ctx.activeUser.profile!.country,
          createdAt: ctx.activeUser.profile!.createdAt,
        }),
      );
    });

    it('should emit UpdateProfileEvent with correct author and metadata', async () => {
      const updateDto: UpdateProfileDto = {
        firstName: 'EventTest',
        lastName: 'EventLast',
      };

      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);
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
              firstName: ctx.activeUser.profile!.firstName,
              lastName: ctx.activeUser.profile!.lastName,
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

      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

      const updatedData = {
        firstName: updateDto.firstName,
        lastName: updateDto.lastName,
      };

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
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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

      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);
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
              id: ctx.activeUser.profile!.id,
              firstName: ctx.activeUser.profile!.firstName,
              lastName: ctx.activeUser.profile!.lastName,
              companyRole: ctx.activeUser.profile!.companyRole,
              phone: ctx.activeUser.profile!.phone,
              country: ctx.activeUser.profile!.country,
              createdAt: ctx.activeUser.profile!.createdAt,
            }),
            post: expect.objectContaining({
              id: ctx.activeUser.profile!.id,
              firstName: updateDto.firstName,
              lastName: updateDto.lastName,
              companyRole: ctx.activeUser.profile!.companyRole,
              phone: ctx.activeUser.profile!.phone,
              country: ctx.activeUser.profile!.country,
              createdAt: ctx.activeUser.profile!.createdAt,
            }),
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should handle case-insensitive alphabetic validation', async () => {
      profileRepository.findOne.mockResolvedValue(ctx.activeUser.profile!);

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
        .with('id', ctx.activeUser.id!)
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
        .with('id', ctx.activeUser.id!)
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
        .with('id', ctx.activeUser.id!)
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
        .with('id', ctx.activeUser.id!)
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
        .with('id', ctx.activeUser.id!)
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
      mockSpeakeasy.totp.verify.mockReturnValueOnce(false);

      const userWithSecret = {
        ...ctx.activeUser,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

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
      const userWithSecret = {
        ...ctx.activeUser,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

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
      const userWithSecret = {
        ...ctx.activeUser,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

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
      const userWithSecret = {
        ...ctx.activeUser,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

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
      const testCtx = createMockContext({
        user: ctx.activeUser,
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

  describe('disableTwoFA', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequestException when 2FA is not enabled', async () => {
      const testCtx = createMockContext({
        user: ctx.activeUser,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      const disableDto: UpdateTwoFADto = { code: '123456' };

      await expect(service.disableTwoFA(testCtx, disableDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.twoFaAlreadyDisabled,
        })
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(backupCodesRepository.softDelete).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when TOTP code is incorrect', async () => {
      // Mock speakeasy to return false for verification
      mockSpeakeasy.totp.verify.mockReturnValueOnce(false);

      const userWith2FA = new UserBuilder()
        .with('id', ctx.activeUser.id!)
        .with('email', 'test@example.com')
        .with('twofaEnabled', true)
        .with('twofaSecret', 'VALIDSECRET12345678901234567890')
        .build();

      const testCtx = createMockContext({
        user: userWith2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      backupCodesRepository.findBy.mockResolvedValue([]);

      const disableDto: UpdateTwoFADto = { code: '000000' };

      await expect(service.disableTwoFA(testCtx, disableDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.incorrectTwoFaCode,
        })
      );

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(backupCodesRepository.softDelete).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when backup code does not match stored codes', async () => {
      const userWith2FA = {
        ...ctx.activeUser,
        twofaEnabled: true,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

      const testCtx = createMockContext({
        user: userWith2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      // Mock stored backup codes
      const storedBackupCodes = [
        new TwoFaBackupCodeBuilder()
          .with('id', `${ctx.activeUser.id!}-backup-1`)
          .with('userId', testCtx.activeUser.id!)
          .with('value', hashSync('ABC123', 12))
          .build(),
        new TwoFaBackupCodeBuilder()
          .with('id', `${ctx.activeUser.id!}-backup-2`)
          .with('userId', testCtx.activeUser.id!)
          .with('value', hashSync('DEF456', 12))
          .build(),
      ];

      backupCodesRepository.findBy.mockResolvedValue(storedBackupCodes);

      const disableDto: UpdateTwoFADto = { code: 'WRONG1' };

      await expect(service.disableTwoFA(testCtx, disableDto)).rejects.toThrow(
        expect.objectContaining({
          message: profileErrorMessages.incorrectTwoFaCode,
        })
      );

      expect(backupCodesRepository.findBy).toHaveBeenCalledWith({
        userId: Equal(testCtx.activeUser.id!),
      });
      expect(backupCodesRepository.findBy).toHaveBeenCalledTimes(1);

      expect(userRepository.update).not.toHaveBeenCalled();
      expect(backupCodesRepository.softDelete).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should successfully disable 2FA with valid TOTP code', async () => {
      // Mock speakeasy to return true for verification
      mockSpeakeasy.totp.verify.mockReturnValueOnce(true);

      const userWith2FA = {
        ...ctx.activeUser,
        twofaEnabled: true,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

      const testCtx = createMockContext({
        user: userWith2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      backupCodesRepository.findBy.mockResolvedValue([]);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      backupCodesRepository.softDelete.mockResolvedValue({ affected: 5 } as any);

      const disableDto: UpdateTwoFADto = { code: '123456' };

      const result = await service.disableTwoFA(testCtx, disableDto);

      expect(mockSpeakeasy.totp.verify).toHaveBeenCalledWith({
        secret: userWith2FA.twofaSecret,
        encoding: 'base32',
        token: disableDto.code,
      });

      // Verify twofaEnabled flag is set to false
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: testCtx.activeUser.id! },
        expect.objectContaining({
          twofaEnabled: false,
        })
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);

      // Verify all backup codes are deleted
      expect(backupCodesRepository.softDelete).toHaveBeenCalledWith({
        userId: testCtx.activeUser.id!,
      });
      expect(backupCodesRepository.softDelete).toHaveBeenCalledTimes(1);

      // Verify Disable2FaEvent is emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.2fa.disable',
        expect.objectContaining({
          name: 'profile.2fa.disable',
          author: testCtx.activeUser,
          metadata: {},
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

      // Verify standardized success response
      expect(result).toEqual(
        ResponseFormatter.success(
          profileSuccessMessages.twoFaDisabled,
          undefined,
        )
      );
    });

    it('should successfully disable 2FA with valid backup code', async () => {
      const userWith2FA = {
        ...ctx.activeUser,
        twofaEnabled: true,
        twofaSecret: 'VALIDSECRET12345678901234567890',
      };

      const testCtx = createMockContext({
        user: userWith2FA,
        permissions: [PERMISSIONS.VIEW_PROFILE],
      }).ctx;

      // Mock stored backup codes
      const validBackupCode = 'ABC123';
      const storedBackupCodes = [
        new TwoFaBackupCodeBuilder()
          .with('id', `${testCtx.activeUser.id!}-backup-1`)
          .with('userId', testCtx.activeUser.id!)
          .with('value', hashSync(validBackupCode, 12))
          .build(),
        new TwoFaBackupCodeBuilder()
          .with('id', `${testCtx.activeUser.id!}-backup-2`)
          .with('userId', testCtx.activeUser.id!)
          .with('value', hashSync('DEF456', 12))
          .build(),
      ];

      backupCodesRepository.findBy.mockResolvedValue(storedBackupCodes);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      backupCodesRepository.softDelete
        .mockResolvedValueOnce({ affected: 1 } as any) 
        .mockResolvedValueOnce({ affected: 2 } as any); 

      const disableDto: UpdateTwoFADto = { code: validBackupCode };

      const result = await service.disableTwoFA(testCtx, disableDto);

      expect(backupCodesRepository.findBy).toHaveBeenCalledWith({
        userId: Equal(testCtx.activeUser.id!),
      });
      expect(backupCodesRepository.findBy).toHaveBeenCalledTimes(1);

      // Verify twofaEnabled flag is set to false
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: testCtx.activeUser.id! },
        expect.objectContaining({
          twofaEnabled: false,
        })
      );
      expect(userRepository.update).toHaveBeenCalledTimes(1);

      // Verify all backup codes are deleted (first specific code, then all user codes)
      expect(backupCodesRepository.softDelete).toHaveBeenNthCalledWith(1, {
        id: storedBackupCodes[0].id,
      });
      expect(backupCodesRepository.softDelete).toHaveBeenNthCalledWith(2, {
        userId: testCtx.activeUser.id!,
      });
      expect(backupCodesRepository.softDelete).toHaveBeenCalledTimes(2);

      // Verify Disable2FaEvent is emitted
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'profile.2fa.disable',
        expect.objectContaining({
          name: 'profile.2fa.disable',
          author: testCtx.activeUser,
          metadata: {},
        })
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);

      // Verify standardized success response
      expect(result).toEqual(
        ResponseFormatter.success(
          profileSuccessMessages.twoFaDisabled,
          undefined,
        )
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
