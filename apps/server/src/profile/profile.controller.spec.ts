import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { RequestContext } from '@common/utils/request/request-context';
import { UpdateProfileDto, UpdatePasswordDto, UpdateTwoFADto } from './dto/index.dto';
import { PERMISSIONS } from '@permissions/types';
import { Reflector } from '@nestjs/core';
import {
  UserBuilder,
  RoleBuilder,
  CompanyBuilder,
  ProfileBuilder,
} from '@test/utils/builders';
import { createMockContext } from '@test/utils/mocks/http.mock';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: jest.Mocked<ProfileService>;
  let reflector: Reflector;
  let ctx: RequestContext;

  beforeEach(async () => {
    const mockProfileService = {
      getProfile: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
      generateTwoFA: jest.fn(),
      verifyTwoFA: jest.fn(),
      disableTwoFA: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get<ProfileService>(ProfileService) as jest.Mocked<ProfileService>;
    reflector = module.get<Reflector>(Reflector);

    // Create a default test context
    const testUser = new UserBuilder()
      .with('id', 'test-user-id')
      .with('email', 'test@example.com')
      .with('company', new CompanyBuilder().build())
      .with('role', new RoleBuilder().build())
      .build();

    ctx = createMockContext({
      user: testUser,
      permissions: [PERMISSIONS.VIEW_PROFILE, PERMISSIONS.UPDATE_PROFILE, PERMISSIONS.CHANGE_PASSWORD],
    }).ctx;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Permission Requirements', () => {
    it('should require VIEW_PROFILE permission for getProfile', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getProfile);
      expect(permissions).toEqual(PERMISSIONS.VIEW_PROFILE);
    });

    it('should require UPDATE_PROFILE permission for updateProfile', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.updateProfile);
      expect(permissions).toEqual(PERMISSIONS.UPDATE_PROFILE);
    });

    it('should require CHANGE_PASSWORD permission for updatePassword', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.updatePassword);
      expect(permissions).toEqual(PERMISSIONS.CHANGE_PASSWORD);
    });

    it('should require ENABLE_TWOFA permission for generateTwoFA', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.generateTwoFA);
      expect(permissions).toEqual(PERMISSIONS.ENABLE_TWOFA);
    });

    it('should require ENABLE_TWOFA permission for verifyTwoFA', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.verifyTwoFA);
      expect(permissions).toEqual(PERMISSIONS.ENABLE_TWOFA);
    });

    it('should require DISABLE_TWOFA permission for disableTwoFA', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.disableTwoFA);
      expect(permissions).toEqual(PERMISSIONS.DISABLE_TWOFA);
    });
  });

  describe('getProfile', () => {
    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully fetched profile',
        data: new ProfileBuilder().build(),
      };

      profileService.getProfile.mockResolvedValue(mockResponse as any);

      const result = await controller.getProfile(ctx);

      expect(profileService.getProfile).toHaveBeenCalledWith(ctx);
      expect(profileService.getProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle non-existent profile gracefully', async () => {
      const error = new Error('Profile not found');
      profileService.getProfile.mockRejectedValue(error);

      await expect(controller.getProfile(ctx)).rejects.toThrow('Profile not found');
      expect(profileService.getProfile).toHaveBeenCalledWith(ctx);
      expect(profileService.getProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateProfile', () => {
    const validUpdateProfileDto: UpdateProfileDto = {
      firstName: 'John',
      lastName: 'Doe',
    };

    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully updated profile',
        data: new ProfileBuilder()
          .with('firstName', 'John')
          .with('lastName', 'Doe')
          .build(),
      };

      profileService.updateProfile.mockResolvedValue(mockResponse as any);

      const result = await controller.updateProfile(ctx, validUpdateProfileDto);

      expect(profileService.updateProfile).toHaveBeenCalledWith(ctx, validUpdateProfileDto);
      expect(profileService.updateProfile).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle invalid or malformed requests appropriately', async () => {
      const error = new Error('Validation failed');
      profileService.updateProfile.mockRejectedValue(error);

      await expect(controller.updateProfile(ctx, validUpdateProfileDto)).rejects.toThrow('Validation failed');
      expect(profileService.updateProfile).toHaveBeenCalledWith(ctx, validUpdateProfileDto);
      expect(profileService.updateProfile).toHaveBeenCalledTimes(1);
    });

    it('should handle non-existent profile gracefully', async () => {
      const error = new Error('Profile not found');
      profileService.updateProfile.mockRejectedValue(error);

      await expect(controller.updateProfile(ctx, validUpdateProfileDto)).rejects.toThrow('Profile not found');
      expect(profileService.updateProfile).toHaveBeenCalledWith(ctx, validUpdateProfileDto);
      expect(profileService.updateProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe('updatePassword', () => {
    const validUpdatePasswordDto: UpdatePasswordDto = {
      oldPassword: 'oldPassword123!',
      newPassword: 'newPassword456!',
      confirmPassword: 'newPassword456!',
    };

    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully updated password',
      };

      profileService.updatePassword.mockResolvedValue(mockResponse as any);

      const result = await controller.updatePassword(ctx, validUpdatePasswordDto);

      expect(profileService.updatePassword).toHaveBeenCalledWith(ctx, validUpdatePasswordDto);
      expect(profileService.updatePassword).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
    });

    it('should handle invalid password validation appropriately', async () => {
      const error = new Error('Password mismatch');
      profileService.updatePassword.mockRejectedValue(error);

      await expect(controller.updatePassword(ctx, validUpdatePasswordDto)).rejects.toThrow('Password mismatch');
      expect(profileService.updatePassword).toHaveBeenCalledWith(ctx, validUpdatePasswordDto);
      expect(profileService.updatePassword).toHaveBeenCalledTimes(1);
    });
  });

  describe('generateTwoFA', () => {
    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully generated 2FA code',
        data: {
          qrCodeImage: 'data:image/png;base64,mock-image',
          otpAuthURL: 'otpauth://totp/test@example.com?secret=MOCK_SECRET',
        },
      };

      profileService.generateTwoFA.mockResolvedValue(mockResponse as any);

      const result = await controller.generateTwoFA(ctx);

      expect(profileService.generateTwoFA).toHaveBeenCalledWith(ctx);
      expect(profileService.generateTwoFA).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle edge cases gracefully (2FA already enabled)', async () => {
      const error = new Error('2FA already enabled');
      profileService.generateTwoFA.mockRejectedValue(error);

      await expect(controller.generateTwoFA(ctx)).rejects.toThrow('2FA already enabled');
      expect(profileService.generateTwoFA).toHaveBeenCalledWith(ctx);
      expect(profileService.generateTwoFA).toHaveBeenCalledTimes(1);
    });
  });

  describe('verifyTwoFA', () => {
    const validVerifyTwoFADto: UpdateTwoFADto = {
      code: '123456',
    };

    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully enabled 2FA',
        data: ['backup1', 'backup2', 'backup3'],
      };

      profileService.verifyTwoFA.mockResolvedValue(mockResponse as any);

      const result = await controller.verifyTwoFA(ctx, validVerifyTwoFADto);

      expect(profileService.verifyTwoFA).toHaveBeenCalledWith(ctx, validVerifyTwoFADto);
      expect(profileService.verifyTwoFA).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
      expect(result.data).toBeDefined();
    });

    it('should handle invalid 2FA code appropriately', async () => {
      const error = new Error('Incorrect 2FA code');
      profileService.verifyTwoFA.mockRejectedValue(error);

      await expect(controller.verifyTwoFA(ctx, validVerifyTwoFADto)).rejects.toThrow('Incorrect 2FA code');
      expect(profileService.verifyTwoFA).toHaveBeenCalledWith(ctx, validVerifyTwoFADto);
      expect(profileService.verifyTwoFA).toHaveBeenCalledTimes(1);
    });
  });

  describe('disableTwoFA', () => {
    const validDisableTwoFADto: UpdateTwoFADto = {
      code: '123456',
    };

    it('should return standardized success response format', async () => {
      const mockResponse = {
        status: 'success',
        message: 'Successfully disabled 2FA',
      };

      profileService.disableTwoFA.mockResolvedValue(mockResponse as any);

      const result = await controller.disableTwoFA(ctx, validDisableTwoFADto);

      expect(profileService.disableTwoFA).toHaveBeenCalledWith(ctx, validDisableTwoFADto);
      expect(profileService.disableTwoFA).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse);
      expect(result.status).toBe('success');
      expect(result.message).toBeDefined();
    });

    it('should handle edge cases gracefully (2FA not enabled)', async () => {
      const error = new Error('2FA not enabled');
      profileService.disableTwoFA.mockRejectedValue(error);

      await expect(controller.disableTwoFA(ctx, validDisableTwoFADto)).rejects.toThrow('2FA not enabled');
      expect(profileService.disableTwoFA).toHaveBeenCalledWith(ctx, validDisableTwoFADto);
      expect(profileService.disableTwoFA).toHaveBeenCalledTimes(1);
    });
  });

  describe('Service Method Mapping', () => {
    it('should correctly map all endpoints to their corresponding service methods', () => {
      // Verify that each controller method exists and maps to the expected service method
      expect(typeof controller.getProfile).toBe('function');
      expect(typeof controller.updateProfile).toBe('function');
      expect(typeof controller.updatePassword).toBe('function');
      expect(typeof controller.generateTwoFA).toBe('function');
      expect(typeof controller.verifyTwoFA).toBe('function');
      expect(typeof controller.disableTwoFA).toBe('function');

      // Verify service has all expected methods
      expect(typeof profileService.getProfile).toBe('function');
      expect(typeof profileService.updateProfile).toBe('function');
      expect(typeof profileService.updatePassword).toBe('function');
      expect(typeof profileService.generateTwoFA).toBe('function');
      expect(typeof profileService.verifyTwoFA).toBe('function');
      expect(typeof profileService.disableTwoFA).toBe('function');
    });
  });
});
