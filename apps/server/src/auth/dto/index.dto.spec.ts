import { authConfig } from '@auth/auth.config';
import { CompanyTypes } from '@common/database/constants';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
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
  signupDtos,
  TwoFADto,
  VerifyEmailDto,
} from './index.dto';

describe('Auth DTOs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const expectValid = async (cls: any, payload: any) => {
    const dto = plainToInstance(cls, payload);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  };

  const expectInvalid = async (cls: any, payload: any, field?: string) => {
    const dto = plainToInstance(cls, payload);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    if (field) {
      expect(errors.map((e) => e.property)).toContain(field);
    }
  };

  describe('ForgotPasswordDto', () => {
    it('should pass validation with valid email', async () => {
      await expectValid(ForgotPasswordDto, { email: 'user@example.com' });
    });

    it('should fail validation when email is missing', async () => {
      await expectInvalid(ForgotPasswordDto, {}, 'email');
    });

    it('should fail validation with invalid email format', async () => {
      await expectInvalid(
        ForgotPasswordDto,
        { email: 'not-an-email' },
        'email',
      );
    });
  });

  describe('ResetPasswordDto', () => {
    const strongPassword =
      'Aa1!' + 'x'.repeat(Math.max(authConfig.minPasswordLength, 8));

    it('should pass validation with strong passwords', async () => {
      await expectValid(ResetPasswordDto, {
        password: strongPassword,
        confirmPassword: strongPassword,
      });
    });

    it('should fail validation with weak password', async () => {
      await expectInvalid(
        ResetPasswordDto,
        { password: 'weak', confirmPassword: 'weak' },
        'password',
      );
    });

    it('should fail validation with weak confirm password', async () => {
      await expectInvalid(
        ResetPasswordDto,
        { password: strongPassword, confirmPassword: 'weak' },
        'confirmPassword',
      );
    });

    it('should pass validation even with password mismatch', async () => {
      await expectValid(ResetPasswordDto, {
        password: strongPassword,
        confirmPassword: strongPassword + 'Z',
      });
    });
  });

  describe('LoginDto', () => {
    it('should pass validation with valid email and password', async () => {
      await expectValid(LoginDto, { email: 'u@e.com', password: 'x' });
    });

    it('should fail validation with invalid email', async () => {
      await expectInvalid(
        LoginDto,
        { email: 'nope', password: 'x' },
        'email',
      );
    });

    it('should fail validation when password is missing', async () => {
      await expectInvalid(LoginDto, { email: 'u@e.com' }, 'password');
    });
  });

  describe('RefreshTokenDto', () => {
    it('should pass validation with syntactically valid JWT', async () => {
      await expectValid(RefreshTokenDto, { refreshToken: 'a.b.c' });
    });

    it('should fail validation with invalid JWT format', async () => {
      await expectInvalid(
        RefreshTokenDto,
        { refreshToken: 'not-jwt' },
        'refreshToken',
      );
    });
  });

  describe('TwoFADto', () => {
    it('should pass validation with valid email, password and 6-digit code', async () => {
      await expectValid(TwoFADto, {
        email: 'u@e.com',
        password: 'x',
        code: '123456',
      });
    });

    it('should fail validation when code length is not 6', async () => {
      await expectInvalid(
        TwoFADto,
        { email: 'u@e.com', password: 'x', code: '123' },
        'code',
      );
    });
  });

  describe('BaseSignupDto', () => {
    const baseSignupData = {
      email: 'u@e.com',
      password: 'Aa1!' + 'x'.repeat(Math.max(authConfig.minPasswordLength, 8)),
      confirmPassword:
        'Aa1!' + 'x'.repeat(Math.max(authConfig.minPasswordLength, 8)),
      firstName: 'john',
      lastName: 'doe',
      phone: '+2348012345678',
      companyType: CompanyTypes.INDIVIDUAL,
    };

    it('should pass validation with all valid fields', async () => {
      await expectValid(BaseSignupDto, baseSignupData);
    });

    it('should fail validation when firstName contains invalid characters', async () => {
      await expectInvalid(
        BaseSignupDto,
        { ...baseSignupData, firstName: 'john_doe' },
        'firstName',
      );
    });

    it('should fail validation with non-Nigerian phone number', async () => {
      await expectInvalid(
        BaseSignupDto,
        { ...baseSignupData, phone: '+15555550123' },
        'phone',
      );
    });

    it('should fail validation when companyType is API_PROVIDER', async () => {
      await expectInvalid(
        BaseSignupDto,
        { ...baseSignupData, companyType: CompanyTypes.API_PROVIDER },
        'companyType',
      );
    });

    it('should pass validation even with password mismatch', async () => {
      await expectValid(BaseSignupDto, {
        ...baseSignupData,
        confirmPassword: baseSignupData.confirmPassword + 'Z',
      });
    });
  });

  describe('IndividualSignupDto', () => {
    const individualSignupData = {
      email: 'u@e.com',
      password: 'Aa1!' + 'xxxxxxxx',
      confirmPassword: 'Aa1!' + 'xxxxxxxx',
      firstName: 'john',
      lastName: 'doe',
      phone: '+2348012345678',
      companyType: CompanyTypes.INDIVIDUAL,
      bvn: '12345678901',
    };

    it('should pass validation when accountNumber is omitted', async () => {
      await expectValid(IndividualSignupDto, individualSignupData);
    });

    it('should fail validation when accountNumber length is not 10', async () => {
      await expectInvalid(
        IndividualSignupDto,
        { ...individualSignupData, accountNumber: '123' },
        'accountNumber',
      );
    });

    it('should fail validation when BVN length is not 11', async () => {
      await expectInvalid(
        IndividualSignupDto,
        { ...individualSignupData, bvn: '123' },
        'bvn',
      );
    });

    it('should pass validation with alphanumeric accountNumber of length 10', async () => {
      await expectValid(IndividualSignupDto, {
        ...individualSignupData,
        accountNumber: 'abc123def0',
      });
    });
  });

  describe('BusinessSignupDto', () => {
    const businessSignupData = {
      email: 'u@e.com',
      password: 'Aa1!' + 'xxxxxxxx',
      confirmPassword: 'Aa1!' + 'xxxxxxxx',
      firstName: 'john',
      lastName: 'doe',
      phone: '+2348012345678',
      companyType: CompanyTypes.BUSINESS,
      companyName: 'Acme',
      companySubtype: 'technology',
    };

    it('should pass validation when rcNumber is omitted', async () => {
      await expectValid(BusinessSignupDto, businessSignupData);
    });

    it('should fail validation when rcNumber length is not 15', async () => {
      await expectInvalid(
        BusinessSignupDto,
        { ...businessSignupData, rcNumber: 'RC123' },
        'rcNumber',
      );
    });

    it('should pass validation with alphanumeric rcNumber of length 15', async () => {
      await expectValid(BusinessSignupDto, {
        ...businessSignupData,
        rcNumber: 'AB12CD34EF56GH7',
      });
    });
  });

  describe('LicensedEntitySignupDto', () => {
    it('should pass validation with all required fields present', async () => {
      await expectValid(LicensedEntitySignupDto, {
        email: 'u@e.com',
        password: 'Aa1!' + 'xxxxxxxx',
        confirmPassword: 'Aa1!' + 'xxxxxxxx',
        firstName: 'john',
        lastName: 'doe',
        phone: '+2348012345678',
        companyType: CompanyTypes.LICENSED_ENTITY,
        companyName: 'Acme',
        companySubtype: 'bank',
      });
    });
  });

  describe('SetupDto', () => {
    const strongPassword = 'Aa1!' + 'xxxxxxxx';

    it('should pass validation with valid names and strong passwords', async () => {
      await expectValid(SetupDto, {
        firstName: 'john',
        lastName: 'doe',
        password: strongPassword,
        confirmPassword: strongPassword,
      });
    });

    it('should fail validation when lastName is empty', async () => {
      await expectInvalid(
        SetupDto,
        {
          firstName: 'john',
          lastName: '',
          password: strongPassword,
          confirmPassword: strongPassword,
        },
        'lastName',
      );
    });

    it('should pass validation even with password mismatch', async () => {
      await expectValid(SetupDto, {
        firstName: 'john',
        lastName: 'doe',
        password: strongPassword,
        confirmPassword: strongPassword + 'Y',
      });
    });
  });

  describe('ResendOtpDto', () => {
    it('should pass validation with non-email string', async () => {
      await expectValid(ResendOtpDto, { email: 'not-an-email' });
    });
  });

  describe('VerifyEmailDto', () => {
    it('should pass validation with email and OTP', async () => {
      await expectValid(VerifyEmailDto, { email: 'u@e.com', otp: '123456' });
    });

    it('should fail validation when OTP is missing', async () => {
      await expectInvalid(VerifyEmailDto, { email: 'u@e.com' }, 'otp');
    });
  });

  describe('signupDtos mapping', () => {
    it('should map supported company types to correct DTO classes', () => {
      expect(signupDtos[CompanyTypes.INDIVIDUAL]).toBe(IndividualSignupDto);
      expect(signupDtos[CompanyTypes.BUSINESS]).toBe(BusinessSignupDto);
      expect(signupDtos[CompanyTypes.LICENSED_ENTITY]).toBe(
        LicensedEntitySignupDto,
      );
    });

    it('should map api-provider to empty string', () => {
      expect(signupDtos['api-provider']).toBe('');
    });
  });

  describe('LoginResponseDto', () => {
    it('should expose only expected fields when created', () => {
      const dto = new LoginResponseDto({
        tokenType: 'Bearer',
        accessToken: 'a',
        refreshToken: 'b',
        expiresIn: 3600,
      });
      expect(dto).toEqual({
        tokenType: 'Bearer',
        accessToken: 'a',
        refreshToken: 'b',
        expiresIn: 3600,
      });
    });
  });
});
