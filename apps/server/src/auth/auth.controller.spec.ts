import { authSuccessMessages } from '@auth/auth.constants';
import { CompanyTypes } from '@common/database/constants';
import { SKIP_AUTH_METADATA_KEY } from '@common/utils/authentication/auth.decorator';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyBuilder,
  ProfileBuilder,
  UserBuilder,
} from '@test/utils/builders';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import {
  BaseSignupDto,
  BusinessSignupDto,
  ForgotPasswordDto,
  IndividualSignupDto,
  LicensedEntitySignupDto,
  LoginDto,
  LoginResponseDto,
  RefreshTokenDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  TwoFADto,
  VerifyEmailDto,
  signupDtos,
} from './dto/index.dto';
import { GetUserResponseDTO } from '@users/dto/index.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  let mockBaseSignupDto: BaseSignupDto;
  let mockIndividualSignupDto: IndividualSignupDto;
  let mockBusinessSignupDto: BusinessSignupDto;
  let mockLicensedEntitySignupDto: LicensedEntitySignupDto;
  let mockSignupResponse: any;

  beforeEach(async () => {
    authService = {
      signup: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      verifyEmail: jest.fn(),
      resendOtp: jest.fn(),
      forgotPassword: jest.fn(),
      resetPassword: jest.fn(),
      setup: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    mockBaseSignupDto = {
      email: 'test@example.com',
      password: 'StrongPassword123!',
      confirmPassword: 'StrongPassword123!',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+2348012345678',
      companyType: CompanyTypes.INDIVIDUAL,
    };

    mockIndividualSignupDto = {
      ...mockBaseSignupDto,
      companyType: CompanyTypes.INDIVIDUAL,
      bvn: '12345678901',
      accountNumber: '1234567890',
    } as IndividualSignupDto;

    mockBusinessSignupDto = {
      ...mockBaseSignupDto,
      companyType: CompanyTypes.BUSINESS,
      companyName: 'Test Business',
      companySubtype: 'Technology',
      rcNumber: 'RC123456789012345',
    } as BusinessSignupDto;

    mockLicensedEntitySignupDto = {
      ...mockBaseSignupDto,
      companyType: CompanyTypes.LICENSED_ENTITY,
      companyName: 'Test Licensed Entity',
      companySubtype: 'Commercial Bank',
    } as LicensedEntitySignupDto;

    mockSignupResponse = ResponseFormatter.success(authSuccessMessages.signup, {
      user: new UserBuilder().build(),
      company: new CompanyBuilder().build(),
      profile: new ProfileBuilder().build(),
    });

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    describe('when signup is called with the right data', () => {
      it('should successfully signup an individual user', async () => {
        authService.signup.mockResolvedValue(mockSignupResponse);

        const result = await controller.signup(mockIndividualSignupDto);

        expect(authService.signup).toHaveBeenCalledTimes(1);
        expect(authService.signup).toHaveBeenCalledWith(
          mockIndividualSignupDto,
          CompanyTypes.INDIVIDUAL,
        );
        expect(result).toEqual(mockSignupResponse);
      });
      it('should successfully signup a business user', async () => {
        authService.signup.mockResolvedValue(mockSignupResponse);
        jest
          .spyOn(IValidationPipe.prototype, 'transform')
          .mockResolvedValue(mockBusinessSignupDto);

        const result = await controller.signup(mockBusinessSignupDto);

        expect(authService.signup).toHaveBeenCalledTimes(1);
        expect(authService.signup).toHaveBeenCalledWith(
          mockBusinessSignupDto,
          CompanyTypes.BUSINESS,
        );
        expect(result).toEqual(mockSignupResponse);
      });
      it('should successfully signup a licensed entity user', async () => {
        authService.signup.mockResolvedValue(mockSignupResponse);

        const result = await controller.signup(mockLicensedEntitySignupDto);

        expect(authService.signup).toHaveBeenCalledTimes(1);
        expect(authService.signup).toHaveBeenCalledWith(
          mockLicensedEntitySignupDto,
          CompanyTypes.LICENSED_ENTITY,
        );
        expect(result).toEqual(mockSignupResponse);
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for signup endpoint', () => {
        // Import Reflector to read metadata
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        // Check if skip auth metadata is set
        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.signup,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('validation', () => {
      it('should handle validation pipe transformation', async () => {
        const validationPipeSpy = jest.spyOn(
          IValidationPipe.prototype,
          'transform',
        );
        authService.signup.mockResolvedValue(mockSignupResponse);

        await controller.signup(mockIndividualSignupDto);

        expect(validationPipeSpy).toHaveBeenCalledTimes(1);
        expect(validationPipeSpy).toHaveBeenCalledWith(
          mockIndividualSignupDto,
          {
            type: 'body',
            metatype: signupDtos[CompanyTypes.INDIVIDUAL],
          },
        );
      });
      it('should handle different company types correctly', async () => {
        authService.signup.mockResolvedValue(mockSignupResponse);
        const validationPipeSpy = jest.spyOn(
          IValidationPipe.prototype,
          'transform',
        );
        const testCases = [
          { dto: mockIndividualSignupDto, type: CompanyTypes.INDIVIDUAL },
          { dto: mockBusinessSignupDto, type: CompanyTypes.BUSINESS },
          {
            dto: mockLicensedEntitySignupDto,
            type: CompanyTypes.LICENSED_ENTITY,
          },
        ];

        for (const testCase of testCases) {
          validationPipeSpy.mockResolvedValue(testCase.dto);
          await controller.signup(testCase.dto);
          expect(authService.signup).toHaveBeenCalledWith(
            testCase.dto,
            testCase.type,
          );
          authService.signup.mockClear();
        }
      });

      it('should validate correct DTO class based on company type', async () => {
        const validationPipeSpy = jest
          .spyOn(IValidationPipe.prototype, 'transform')
          .mockResolvedValue(mockBusinessSignupDto);
        authService.signup.mockResolvedValue(mockSignupResponse);

        await controller.signup(mockBusinessSignupDto);

        expect(validationPipeSpy).toHaveBeenCalledWith(mockBusinessSignupDto, {
          type: 'body',
          metatype: signupDtos[CompanyTypes.BUSINESS],
        });
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Signup failed');
        authService.signup.mockRejectedValue(error);

        await expect(
          controller.signup(mockIndividualSignupDto),
        ).rejects.toThrow('Signup failed');
        expect(authService.signup).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('login', () => {
    let loginDto: LoginDto;

    beforeEach(() => {
      loginDto = {
        email: 'test@example.com',
        password: 'StrongPass123!',
      };
    });

    describe('when login is called with valid credentials', () => {
      it('should successfully login user', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Login successful',
          data: { accessToken: 'token' },
        };
        authService.login.mockResolvedValue(mockResponse);

        const result = await controller.login(loginDto);

        expect(authService.login).toHaveBeenCalledTimes(1);
        expect(authService.login).toHaveBeenCalledWith(loginDto);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for login endpoint', () => {
        // Import Reflector to read metadata
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        // Check if skip auth metadata is set
        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.login,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid credentials');
        authService.login.mockRejectedValue(error);

        await expect(controller.login(loginDto)).rejects.toThrow(
          'Invalid credentials',
        );
        expect(authService.login).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('refresh', () => {
    let refreshTokenDto: RefreshTokenDto;

    beforeEach(() => {
      refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };
    });

    describe('when refresh is called with valid token', () => {
      it('should successfully refresh token', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Token refreshed',
          data: new LoginResponseDto({
            accessToken: 'new-access-token',
            tokenType: 'Bearer',
            refreshToken: 'refresh-token',
            expiresIn: 20,
          }),
        };
        authService.refreshToken.mockResolvedValue(mockResponse);

        const result = await controller.refresh(refreshTokenDto);

        expect(authService.refreshToken).toHaveBeenCalledTimes(1);
        expect(authService.refreshToken).toHaveBeenCalledWith(
          refreshTokenDto.refreshToken,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for refresh endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.refresh,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid refresh token');
        authService.refreshToken.mockRejectedValue(error);

        await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
          'Invalid refresh token',
        );
        expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('verifyEmail', () => {
    let verifyEmailDto: VerifyEmailDto;

    beforeEach(() => {
      verifyEmailDto = {
        email: 'test@example.com',
        otp: '123456',
      };
    });

    describe('when verifyEmail is called with valid data', () => {
      it('should successfully verify email', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Email verified successfully',
          data: new GetUserResponseDTO(new UserBuilder().build()),
        };
        authService.verifyEmail.mockResolvedValue(mockResponse);

        const result = await controller.verifyEmail(verifyEmailDto);

        expect(authService.verifyEmail).toHaveBeenCalledTimes(1);
        expect(authService.verifyEmail).toHaveBeenCalledWith(verifyEmailDto);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when verifyEmail is called with invalid data', () => {
      it('should throw error for invalid OTP', async () => {
        const invalidDto = { ...verifyEmailDto, otp: '000000' };
        const error = new Error('Invalid OTP');
        authService.verifyEmail.mockRejectedValue(error);

        await expect(controller.verifyEmail(invalidDto)).rejects.toThrow('Invalid OTP');
        expect(authService.verifyEmail).toHaveBeenCalledWith(invalidDto);
      });

      it('should throw error for expired OTP', async () => {
        const error = new Error('OTP has expired');
        authService.verifyEmail.mockRejectedValue(error);

        await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow('OTP has expired');
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for verifyEmail endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.verifyEmail,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid OTP');
        authService.verifyEmail.mockRejectedValue(error);

        await expect(controller.verifyEmail(verifyEmailDto)).rejects.toThrow(
          'Invalid OTP',
        );
        expect(authService.verifyEmail).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('resendOtp', () => {
    let resendOtpDto: ResendOtpDto;

    beforeEach(() => {
      resendOtpDto = {
        email: 'test@example.com',
      };
    });

    describe('when resendOtp is called with valid data', () => {
      it('should successfully resend OTP', async () => {
        const mockResponse = {
          status: 'success',
          message: 'OTP resent successfully',
          data: {},
        };
        authService.resendOtp.mockResolvedValue(mockResponse);

        const result = await controller.resendOtp(resendOtpDto);

        expect(authService.resendOtp).toHaveBeenCalledTimes(1);
        expect(authService.resendOtp).toHaveBeenCalledWith(resendOtpDto);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for resendOtp endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.resendOtp,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Email not found');
        authService.resendOtp.mockRejectedValue(error);

        await expect(controller.resendOtp(resendOtpDto)).rejects.toThrow(
          'Email not found',
        );
        expect(authService.resendOtp).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('twoFA', () => {
    let twoFADto: TwoFADto;

    beforeEach(() => {
      twoFADto = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        code: '123456',
      };
    });

    describe('when twoFA is called with valid data', () => {
      it('should successfully authenticate with 2FA', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Login successful',
          data: { accessToken: 'token' },
        };
        authService.login.mockResolvedValue(mockResponse);

        const result = await controller.twoFA(twoFADto);

        expect(authService.login).toHaveBeenCalledTimes(1);
        expect(authService.login).toHaveBeenCalledWith(twoFADto);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when twoFA is called with invalid data', () => {
      it('should throw error for invalid 2FA code', async () => {
        const invalidDto = { ...twoFADto, code: '000000' };
        const error = new Error('Invalid 2FA code');
        authService.login.mockRejectedValue(error);

        await expect(controller.twoFA(invalidDto)).rejects.toThrow('Invalid 2FA code');
        expect(authService.login).toHaveBeenCalledWith(invalidDto);
      });

      it('should throw error for expired 2FA code', async () => {
        const error = new Error('2FA code has expired');
        authService.login.mockRejectedValue(error);

        await expect(controller.twoFA(twoFADto)).rejects.toThrow('2FA code has expired');
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for twoFA endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.twoFA,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid 2FA code');
        authService.login.mockRejectedValue(error);

        await expect(controller.twoFA(twoFADto)).rejects.toThrow(
          'Invalid 2FA code',
        );
        expect(authService.login).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('forgotPassword', () => {
    let forgotPasswordDto: ForgotPasswordDto;

    beforeEach(() => {
      forgotPasswordDto = {
        email: 'test@example.com',
      };
    });

    describe('when forgotPassword is called with valid data', () => {
      it('should successfully send forgot password email', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Reset email sent',
          data: {},
        };
        authService.forgotPassword.mockResolvedValue(mockResponse);

        const result = await controller.forgotPassword(forgotPasswordDto);

        expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
        expect(authService.forgotPassword).toHaveBeenCalledWith(
          forgotPasswordDto.email,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for forgotPassword endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.forgotPassword,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Email service error');
        authService.forgotPassword.mockRejectedValue(error);

        await expect(
          controller.forgotPassword(forgotPasswordDto),
        ).rejects.toThrow('Email service error');
        expect(authService.forgotPassword).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('resetPassword', () => {
    let resetPasswordDto: ResetPasswordDto;
    const resetToken = 'valid-reset-token';

    beforeEach(() => {
      resetPasswordDto = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };
    });

    describe('when resetPassword is called with valid data', () => {
      it('should successfully reset password', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Password reset successfully',
          data: null,
        };
        authService.resetPassword.mockResolvedValue(mockResponse);

        const result = await controller.resetPassword(
          resetPasswordDto,
          resetToken,
        );

        expect(authService.resetPassword).toHaveBeenCalledTimes(1);
        expect(authService.resetPassword).toHaveBeenCalledWith(
          resetPasswordDto,
          resetToken,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when resetPassword is called with invalid data', () => {
      it('should throw error for invalid reset token', async () => {
        const invalidToken = 'invalid-token';
        const error = new Error('Invalid or expired reset token');
        authService.resetPassword.mockRejectedValue(error);

        await expect(
          controller.resetPassword(resetPasswordDto, invalidToken),
        ).rejects.toThrow('Invalid or expired reset token');
        expect(authService.resetPassword).toHaveBeenCalledWith(
          resetPasswordDto,
          invalidToken,
        );
      });

      it('should throw error for mismatched passwords', async () => {
        const invalidDto = {
          ...resetPasswordDto,
          confirmPassword: 'DifferentPassword123!',
        };
        const error = new Error('Passwords do not match');
        authService.resetPassword.mockRejectedValue(error);

        await expect(
          controller.resetPassword(invalidDto, resetToken),
        ).rejects.toThrow('Passwords do not match');
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for resetPassword endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.resetPassword,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid reset token');
        authService.resetPassword.mockRejectedValue(error);

        await expect(
          controller.resetPassword(resetPasswordDto, resetToken),
        ).rejects.toThrow('Invalid reset token');
        expect(authService.resetPassword).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('setup', () => {
    let setupDto: SetupDto;
    const token = 'valid-setup-token';

    beforeEach(() => {
      setupDto = {
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
        lastName: 'Bobby',
        firstName: 'John',
      };
    });

    describe('when setup is called with valid data', () => {
      it('should successfully setup user account', async () => {
        const mockResponse = {
          status: 'success',
          message: 'Account setup successfully',
          data: {},
        };
        authService.setup.mockResolvedValue(mockResponse);

        const result = await controller.setup(setupDto, token);

        expect(authService.setup).toHaveBeenCalledTimes(1);
        expect(authService.setup).toHaveBeenCalledWith(setupDto, token);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('when setup is called with invalid data', () => {
      it('should throw error for invalid setup token', async () => {
        const invalidToken = 'invalid-token';
        const error = new Error('Invalid or expired setup token');
        authService.setup.mockRejectedValue(error);

        await expect(controller.setup(setupDto, invalidToken)).rejects.toThrow(
          'Invalid or expired setup token',
        );
        expect(authService.setup).toHaveBeenCalledWith(setupDto, invalidToken);
      });

      it('should throw error for mismatched passwords', async () => {
        const invalidDto = {
          ...setupDto,
          confirmPassword: 'DifferentPassword123!',
        };
        const error = new Error('Passwords do not match');
        authService.setup.mockRejectedValue(error);

        await expect(controller.setup(invalidDto, token)).rejects.toThrow(
          'Passwords do not match',
        );
      });
    });

    describe('authentication', () => {
      it('should skip auth guard for setup endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuth = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.setup,
        );
        expect(skipAuth).toBe(true);
      });
    });

    describe('error', () => {
      it('should propagate errors from auth service', async () => {
        const error = new Error('Invalid setup token');
        authService.setup.mockRejectedValue(error);

        await expect(controller.setup(setupDto, token)).rejects.toThrow(
          'Invalid setup token',
        );
        expect(authService.setup).toHaveBeenCalledTimes(1);
      });
    });
  });
});
