import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  Company,
  Profile,
  Settings,
  User,
  Role,
  TwoFaBackupCode,
  UserStatuses,
  CompanyStatuses,
} from '@common/database/entities';
import {
  UserBuilder,
  RoleBuilder,
  ProfileBuilder,
  CompanyBuilder,
  SettingsBuilder,
  TwoFaBackupCodeBuilder,
} from '@test/utils/builders';
import {
  createMockRepository,
  MockRepository,
  mockEventEmitter,
} from '@test/utils/mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Auth } from '@common/utils/authentication/auth.helper';
import { ConfigService } from '@nestjs/config';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import {
  BusinessSignupDto,
  IndividualSignupDto,
  LicensedEntitySignupDto,
  LoginDto,
  ResendOtpDto,
  ResetPasswordDto,
  SetupDto,
  TwoFADto,
  VerifyEmailDto,
} from './dto/index.dto';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { authSuccessMessages } from '@auth/auth.constants';
import { CompanyTypes, ROLES } from '@common/database/constants';
import { CompanyTiers } from '@company/types';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';
import { GetUserResponseDTO } from '@users/dto/index.dto';
import { AuthEvents } from '@shared/events/auth.event';
import moment from 'moment';
import { Equal } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import * as speakeasy from 'speakeasy';
import * as authHelpers from '@common/utils/helpers/auth.helpers';

// Mock external modules
jest.mock('bcryptjs');
jest.mock('speakeasy');
jest.mock('@common/utils/helpers/auth.helpers');
jest.mock('moment');

const mockedBcryptjs = bcryptjs as jest.Mocked<typeof bcryptjs>;
const mockedSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>;
const mockedAuthHelpers = authHelpers as jest.Mocked<typeof authHelpers>;
const mockedMoment = moment as jest.Mocked<typeof moment>;

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: MockRepository<User>;
  let settingsRepository: MockRepository<Settings>;
  let companyRepository: MockRepository<Company>;
  let profileRepository: MockRepository<Profile>;
  let roleRepository: MockRepository<Role>;
  let backupCodesRepository: MockRepository<TwoFaBackupCode>;
  let kongConsumerService: jest.Mocked<KongConsumerService>;
  let auth: jest.Mocked<Auth>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let config: jest.Mocked<ConfigService>;

  // Test data builders
  let mockUser: User;
  let mockCompany: Company;
  let mockRole: Role;
  let mockProfile: Profile;
  let mockSettings: Settings;
  let mockBackupCode: TwoFaBackupCode;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = createMockRepository<User>();
    settingsRepository = createMockRepository<Settings>();
    companyRepository = createMockRepository<Company>();
    profileRepository = createMockRepository<Profile>();
    roleRepository = createMockRepository<Role>();
    backupCodesRepository = createMockRepository<TwoFaBackupCode>();

    // Initialize service mocks
    kongConsumerService = {
      updateOrCreateConsumer: jest.fn(),
    } as any;

    auth = {
      sign: jest.fn(),
      verify: jest.fn(),
      getToken: jest.fn(),
      hashToken: jest.fn(),
    } as any;

    eventEmitter = mockEventEmitter();
    config = {
      get: jest.fn(),
    } as any;

    // Build test entities
    mockRole = new RoleBuilder()
      .with('id', 'role-id')
      .with('slug', ROLES.ADMIN)
      .build();

    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.BUSINESS)
      .with('tier', CompanyTiers.TIER_0)
      .build();

    mockProfile = new ProfileBuilder()
      .with('firstName', 'John')
      .with('lastName', 'Doe')
      .with('phone', '+2348012345678')
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('password', 'hashed-password')
      .with('status', UserStatuses.ACTIVE)
      .with('emailVerified', true)
      .with('roleId', mockRole.id!)
      .with('companyId', mockCompany.id!)
      .with('company', mockCompany)
      .with('profile', mockProfile)
      .build();

    mockSettings = new SettingsBuilder()
      .with('name', BUSINESS_SETTINGS_NAME)
      .with(
        'value',
        JSON.stringify({
          companySubtypes: {
            [CompanyTypes.BUSINESS]: [{ value: 'fintech', default: true }],
            [CompanyTypes.LICENSED_ENTITY]: [{ value: 'bank', default: true }],
          },
        }),
      )
      .build();

    mockBackupCode = new TwoFaBackupCodeBuilder()
      .with('id', 'backup-code-id')
      .with('userId', mockUser.id!)
      .with('value', 'hashed-backup-code')
      .build();

    // Setup default mock implementations
    config.get.mockImplementation((key: string) => {
      if (key === 'auth.defaultOtpExpiresMinutes') return 30;
      return null;
    });

    (mockedMoment as any).mockReturnValue({
      add: jest.fn().mockReturnThis(),
      toDate: jest.fn().mockReturnValue(new Date()),
      diff: jest.fn().mockReturnValue(3600),
    });

    mockedBcryptjs.hashSync.mockReturnValue('hashed-password');
    mockedBcryptjs.compareSync.mockReturnValue(true);
    mockedAuthHelpers.generateOtp.mockReturnValue('123456');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'UserRepository', useValue: userRepository },
        { provide: 'SettingsRepository', useValue: settingsRepository },
        { provide: 'CompanyRepository', useValue: companyRepository },
        { provide: 'ProfileRepository', useValue: profileRepository },
        { provide: 'RoleRepository', useValue: roleRepository },
        {
          provide: 'TwoFaBackupCodeRepository',
          useValue: backupCodesRepository,
        },
        { provide: KongConsumerService, useValue: kongConsumerService },
        { provide: Auth, useValue: auth },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    describe('when signing up as BUSINESS', () => {
      const businessSignupDto: BusinessSignupDto = {
        email: 'business@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '+2348012345678',
        accountNumber: '1234567890',
        companyName: 'Test Business',
        companySubtype: 'fintech',
        rcNumber: 'RC123456',
        companyType: CompanyTypes.BUSINESS,
      };

      it('should successfully create business user when valid data provided', async () => {
        userRepository.count.mockResolvedValue(0);
        companyRepository.findOne.mockResolvedValue(null);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        roleRepository.findOne.mockResolvedValue(mockRole);
        companyRepository.save.mockResolvedValue(mockCompany);
        userRepository.save.mockResolvedValue(mockUser);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.signup(
          businessSignupDto,
          CompanyTypes.BUSINESS,
        );

        expect(result).toEqual(
          ResponseFormatter.success(
            authSuccessMessages.signup,
            expect.any(GetUserResponseDTO),
          ),
        );
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.SIGN_UP, expect.objectContaining({
          name: AuthEvents.SIGN_UP,
          author: expect.objectContaining({
            email: mockUser.email,
            id: mockUser.id
          }),
          metadata: expect.objectContaining({
            otp: expect.any(String)
          })
        }));
        expect(userRepository.save).toHaveBeenCalled();
        expect(companyRepository.save).toHaveBeenCalled();
      });

      it('should throw error when user with email already exists', async () => {
        userRepository.count.mockResolvedValue(1);

        await expect(
          service.signup(businessSignupDto, CompanyTypes.BUSINESS),
        ).rejects.toThrow(IBadRequestException);

        expect(userRepository.count).toHaveBeenCalledWith({
          where: { email: Equal(businessSignupDto.email.trim().toLowerCase()) },
        });
      });

      it('should throw error when company with RC number already exists', async () => {
        userRepository.count.mockResolvedValue(0);
        companyRepository.findOne.mockResolvedValue(mockCompany);

        await expect(
          service.signup(businessSignupDto, CompanyTypes.BUSINESS),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { rcNumber: Equal(businessSignupDto.rcNumber) },
        });
      });

      it('should throw error when passwords do not match', async () => {
        const invalidDto = {
          ...businessSignupDto,
          confirmPassword: 'DifferentPass123!',
        };
        userRepository.count.mockResolvedValue(0);
        companyRepository.findOne.mockResolvedValue(null);

        await expect(
          service.signup(invalidDto, CompanyTypes.BUSINESS),
        ).rejects.toThrow(IBadRequestException);
      });

      it('should throw error when API consumer role not found', async () => {
        userRepository.count.mockResolvedValue(0);
        companyRepository.findOne.mockResolvedValue(null);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        roleRepository.findOne.mockResolvedValue(null);

        await expect(
          service.signup(businessSignupDto, CompanyTypes.BUSINESS),
        ).rejects.toThrow(IBadRequestException);
      });

      it('should throw error when invalid company subtype provided', async () => {
        const invalidDto = {
          ...businessSignupDto,
          companySubtype: 'invalid-subtype',
        };
        userRepository.count.mockResolvedValue(0);
        companyRepository.findOne.mockResolvedValue(null);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        roleRepository.findOne.mockResolvedValue(mockRole);

        await expect(
          service.signup(invalidDto, CompanyTypes.BUSINESS),
        ).rejects.toThrow(IBadRequestException);
      });
    });

    describe('when signing up as INDIVIDUAL', () => {
      const individualSignupDto: IndividualSignupDto = {
        email: 'individual@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '+2348012345678',
        accountNumber: '9876543210',
        bvn: '12345678901',
        companyType: CompanyTypes.INDIVIDUAL,
      };

      it('should successfully create individual user when valid data provided', async () => {
        userRepository.count.mockResolvedValue(0);
        userRepository.findOne.mockResolvedValue(null);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        roleRepository.findOne.mockResolvedValue(mockRole);
        companyRepository.save.mockResolvedValue(mockCompany);
        userRepository.save.mockResolvedValue(mockUser);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.signup(
          individualSignupDto,
          CompanyTypes.INDIVIDUAL,
        );

        expect(result).toEqual(
          ResponseFormatter.success(
            authSuccessMessages.signup,
            expect.any(GetUserResponseDTO),
          ),
        );
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.SIGN_UP, expect.objectContaining({
          name: AuthEvents.SIGN_UP,
          author: expect.objectContaining({
            email: mockUser.email,
            id: mockUser.id
          }),
          metadata: expect.objectContaining({
            otp: expect.any(String)
          })
        }));
      });

      it('should throw error when user with BVN already exists', async () => {
        userRepository.count.mockResolvedValue(0);
        userRepository.findOne.mockResolvedValue(mockUser);

        await expect(
          service.signup(individualSignupDto, CompanyTypes.INDIVIDUAL),
        ).rejects.toThrow(IBadRequestException);
      });
    });

    describe('when signing up as LICENSED_ENTITY', () => {
      const licensedEntitySignupDto: LicensedEntitySignupDto = {
        email: 'bank@example.com',
        firstName: 'Admin',
        lastName: 'User',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '+2348012345678',
        companyName: 'Test Bank',
        companySubtype: 'bank',
        companyType: CompanyTypes.LICENSED_ENTITY,
      };

      it('should successfully create licensed entity user when valid data provided', async () => {
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        roleRepository.findOne.mockResolvedValue(mockRole);
        companyRepository.save.mockResolvedValue(mockCompany);
        userRepository.save.mockResolvedValue(mockUser);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.signup(
          licensedEntitySignupDto,
          CompanyTypes.LICENSED_ENTITY,
        );

        expect(result).toEqual(
          ResponseFormatter.success(
            authSuccessMessages.signup,
            expect.any(GetUserResponseDTO),
          ),
        );
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.SIGN_UP, expect.objectContaining({
          name: AuthEvents.SIGN_UP,
          author: expect.objectContaining({
            email: mockUser.email,
            id: mockUser.id
          }),
          metadata: expect.objectContaining({
            otp: expect.any(String)
          })
        }));
      });
    });

    it('should throw error for invalid company type', async () => {
      const invalidDto = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'StrongPass123!',
        confirmPassword: 'StrongPass123!',
        phone: '+2348012345678',
      };

      await expect(
        service.signup(invalidDto, 'INVALID_TYPE' as CompanyTypes),
      ).rejects.toThrow(IBadRequestException);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'StrongPass123!',
    };

    it('should successfully login user with valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcryptjs.compareSync.mockReturnValue(true);
      auth.sign
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      auth.verify.mockResolvedValue({ iat: 1234567890, exp: 1234571490 });
      auth.hashToken.mockResolvedValue('hashed-refresh-token');
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.login(loginDto);

      expect(result.data).toHaveProperty('accessToken', 'access-token');
      expect(result.data).toHaveProperty('refreshToken', 'refresh-token');
      expect(result.data).toHaveProperty('tokenType', 'Bearer');
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.LOGIN, expect.objectContaining({
        name: AuthEvents.LOGIN,
        author: expect.objectContaining({
          email: mockUser.email,
          id: mockUser.id
        }),
        metadata: expect.any(Object)
      }));
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      mockedBcryptjs.compareSync.mockReturnValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when email is not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      userRepository.findOne.mockResolvedValue(unverifiedUser);
      mockedBcryptjs.compareSync.mockReturnValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when company is not active', async () => {
      const inactiveCompanyUser = {
        ...mockUser,
        company: { ...mockCompany, status: CompanyStatuses.INACTIVE },
      };
      userRepository.findOne.mockResolvedValue(inactiveCompanyUser);
      mockedBcryptjs.compareSync.mockReturnValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when user account is not active', async () => {
      const inactiveUser = { ...mockUser, status: UserStatuses.INACTIVE };
      userRepository.findOne.mockResolvedValue(inactiveUser);
      mockedBcryptjs.compareSync.mockReturnValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    describe('when 2FA is enabled', () => {
      const twoFaUser = {
        ...mockUser,
        twofaEnabled: true,
        twofaSecret: 'secret',
        emailVerified: true,
        status: UserStatuses.ACTIVE,
        company: { ...mockCompany, status: CompanyStatuses.ACTIVE },
      };
      const twoFaDto: TwoFADto = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        code: '123456',
      };

      it('should throw error when 2FA code is not provided', async () => {
        const twoFaUser: User = {
          ...mockUser,
          twofaEnabled: true,
          twofaSecret: 'secret',
          emailVerified: true,
        };
        userRepository.findOne.mockResolvedValue(twoFaUser);
        mockedBcryptjs.compareSync.mockReturnValue(true);

        await expect(service.login(loginDto)).rejects.toThrow(
          'Please provide 2FA code',
        );
      });

      it('should successfully login with valid 2FA code', async () => {
        userRepository.findOne.mockResolvedValue(twoFaUser);
        mockedBcryptjs.compareSync.mockReturnValue(true);
        (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(true);
        auth.sign
          .mockResolvedValueOnce('access-token')
          .mockResolvedValueOnce('refresh-token');
        auth.verify.mockResolvedValue({ iat: 1234567890, exp: 1234571490 });
        auth.hashToken.mockResolvedValue('hashed-refresh-token');
        userRepository.save.mockResolvedValue(twoFaUser);

        const result = await service.login(twoFaDto);

        expect(result.data).toHaveProperty('accessToken', 'access-token');
        expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledWith({
          secret: twoFaUser.twofaSecret,
          encoding: 'base32',
          token: twoFaDto.code,
        });
      });

      it('should throw error when 2FA code is invalid', async () => {
        userRepository.findOne.mockResolvedValue(twoFaUser);
        mockedBcryptjs.compareSync.mockReturnValue(true);
        (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(false);

        await expect(service.login(twoFaDto)).rejects.toThrow(
          IBadRequestException,
        );
      });

      it('should successfully login with valid backup code', async () => {
        const backupCodeDto = { ...twoFaDto, code: 'backup-code-123' };
        userRepository.findOne.mockResolvedValue(twoFaUser);
        mockedBcryptjs.compareSync
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true);
        backupCodesRepository.findBy.mockResolvedValue([mockBackupCode]);
        backupCodesRepository.softDelete.mockResolvedValue({
          affected: 1,
        } as any);
        auth.sign
          .mockResolvedValueOnce('access-token')
          .mockResolvedValueOnce('refresh-token');
        auth.verify.mockResolvedValue({ iat: 1234567890, exp: 1234571490 });
        auth.hashToken.mockResolvedValue('hashed-refresh-token');
        userRepository.save.mockResolvedValue(twoFaUser);

        const result = await service.login(backupCodeDto);

        expect(result.data).toHaveProperty('accessToken', 'access-token');
        expect(backupCodesRepository.softDelete).toHaveBeenCalledWith({
          id: mockBackupCode.id,
        });
      });

      it('should throw error when backup code is invalid', async () => {
        const backupCodeDto = { ...twoFaDto, code: 'invalid-backup-code' };
        userRepository.findOne.mockResolvedValue(twoFaUser);
        mockedBcryptjs.compareSync
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(false);
        backupCodesRepository.findBy.mockResolvedValue([mockBackupCode]);

        await expect(service.login(backupCodeDto)).rejects.toThrow(
          IBadRequestException,
        );
      });
    });
  });

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token';

    it('should successfully refresh access token with valid refresh token', async () => {
      const decodedToken = { id: mockUser.id!, count: 1, iat: 1234567890 };
      auth.hashToken.mockResolvedValue('hashed-refresh-token');
      userRepository.findOneByOrFail.mockResolvedValue(mockUser);
      auth.verify
        .mockResolvedValueOnce(decodedToken)
        .mockResolvedValueOnce({ iat: 1234567890, exp: 1234571490 });
      auth.sign
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      auth.hashToken
        .mockResolvedValueOnce('hashed-refresh-token')
        .mockResolvedValueOnce('new-hashed-refresh-token');
      userRepository.save.mockResolvedValue(mockUser);

      const result = await service.refreshToken(refreshToken);

      expect(result.data).toHaveProperty('accessToken', 'new-access-token');
      expect(result.data).toHaveProperty('refreshToken', 'new-refresh-token');
      expect(auth.sign).toHaveBeenCalledWith({ id: mockUser.id, count: 2 });
    });

    it('should throw error when refresh token is invalid', async () => {
      auth.hashToken.mockResolvedValue('hashed-refresh-token');
      userRepository.findOneByOrFail.mockRejectedValue(
        new Error('User not found'),
      );

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when refresh token count exceeds limit', async () => {
      const decodedToken = { id: mockUser.id!, count: 96, iat: 1234567890 };
      auth.hashToken.mockResolvedValue('hashed-refresh-token');
      userRepository.findOneByOrFail.mockResolvedValue(mockUser);
      auth.verify.mockResolvedValue(decodedToken);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when user ID in token does not match', async () => {
      const decodedToken = {
        id: 'different-user-id',
        count: 1,
        iat: 1234567890,
      };
      auth.hashToken.mockResolvedValue('hashed-refresh-token');
      userRepository.findOneByOrFail.mockResolvedValue(mockUser);
      auth.verify.mockResolvedValue(decodedToken);

      await expect(service.refreshToken(refreshToken)).rejects.toThrow(
        IBadRequestException,
      );
    });
  });

  describe('forgotPassword', () => {
    const email = 'test@example.com';

    it('should successfully send reset password email when user exists', async () => {
      userRepository.findOneBy.mockResolvedValue(mockUser);
      auth.getToken.mockResolvedValue('reset-token');
      auth.hashToken.mockResolvedValue('hashed-reset-token');
      userRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.forgotPassword(email);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.forgotPassword(email)),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        {
          resetPasswordToken: 'hashed-reset-token',
          resetPasswordExpires: expect.any(Date),
        },
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.RESET_PASSWORD_REQUEST, expect.objectContaining({
        name: AuthEvents.RESET_PASSWORD_REQUEST,
        user: expect.objectContaining({
          email: mockUser.email,
          id: mockUser.id
        }),
        metadata: expect.objectContaining({
          token: expect.any(String)
        })
      }));
    });

    it('should return success response even when user does not exist', async () => {
      userRepository.findOneBy.mockResolvedValue(null);

      const result = await service.forgotPassword(email);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.forgotPassword(email)),
      );
      expect(auth.getToken).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetPasswordDto: ResetPasswordDto = {
      password: 'NewStrongPass123!',
      confirmPassword: 'NewStrongPass123!',
    };

    describe('when using reset token', () => {
      const resetToken = 'valid-reset-token';

      it('should successfully reset password with valid token', async () => {
        const userWithDifferentPassword = { ...mockUser, password: 'old-hashed-password' };
        auth.hashToken.mockResolvedValue('hashed-reset-token');
        userRepository.findOneBy.mockResolvedValue(userWithDifferentPassword);
        mockedBcryptjs.compareSync.mockImplementation(() => {
          // Return false for the password comparison check to indicate new password is different from old
          return false;
        });
        mockedBcryptjs.hashSync.mockReturnValue('new-hashed-password');
        userRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.resetPassword(
          resetPasswordDto,
          resetToken,
        );

        expect(result).toEqual(
          ResponseFormatter.success(authSuccessMessages.resetPassword),
        );
        expect(userRepository.update).toHaveBeenCalledWith(
          { id: userWithDifferentPassword.id },
          expect.objectContaining({
            resetPasswordToken: null,
            resetPasswordExpires: null,
            password: 'new-hashed-password',
            emailVerified: true,
          }),
        );
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.RESET_PASSWORD_REQUEST, expect.objectContaining({
          name: AuthEvents.RESET_PASSWORD_REQUEST,
          user: expect.objectContaining({
            id: expect.any(String)
          }),
          metadata: expect.any(Object)
        }));
      });

      it('should throw error when reset token is invalid or expired', async () => {
        auth.hashToken.mockResolvedValue('hashed-reset-token');
        userRepository.findOneBy.mockResolvedValue(null);

        await expect(
          service.resetPassword(resetPasswordDto, resetToken),
        ).rejects.toThrow(IBadRequestException);
      });
    });

    describe('when using User object', () => {
      it('should successfully reset password for authenticated user', async () => {
        const userInstance = Object.assign(new User(), { ...mockUser, password: 'old-hashed-password' });
        mockedBcryptjs.compareSync.mockReturnValue(false);
        mockedBcryptjs.hashSync.mockReturnValue('new-hashed-password');
        userRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.resetPassword(resetPasswordDto, userInstance);

        expect(result).toEqual(
          ResponseFormatter.success(authSuccessMessages.changePassword),
        );
        expect(userRepository.update).toHaveBeenCalledWith(
          { id: userInstance.id },
          expect.objectContaining({
            password: 'new-hashed-password',
            emailVerified: true,
          }),
        );
      });
    });

    it('should throw error when passwords do not match', async () => {
      const invalidDto = {
        ...resetPasswordDto,
        confirmPassword: 'DifferentPass123!',
      };
      const userInstance = Object.assign(new User(), mockUser);

      await expect(service.resetPassword(invalidDto, userInstance)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when new password is same as old password', async () => {
      const userInstance = Object.assign(new User(), mockUser);
      mockedBcryptjs.compareSync.mockReturnValue(true);

      await expect(
        service.resetPassword(resetPasswordDto, userInstance),
      ).rejects.toThrow(IBadRequestException);
    });
  });

  describe('setup', () => {
    const setupDto: SetupDto = {
      firstName: 'John',
      lastName: 'Doe',
      password: 'NewStrongPass123!',
      confirmPassword: 'NewStrongPass123!',
    };
    const setupToken = 'valid-setup-token';

    it('should successfully setup user account with valid token', async () => {
      auth.hashToken.mockResolvedValue('hashed-setup-token');
      userRepository.findOneBy.mockResolvedValue(mockUser);
      mockedBcryptjs.hashSync.mockReturnValue('new-hashed-password');
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      profileRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.setup(setupDto, setupToken);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.signup),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        expect.objectContaining({
          resetPasswordToken: null,
          resetPasswordExpires: null,
          password: 'new-hashed-password',
          status: UserStatuses.ACTIVE,
          emailVerified: true,
        }),
      );
      expect(profileRepository.update).toHaveBeenCalledWith(
        { userId: mockUser.id },
        { firstName: setupDto.firstName, lastName: setupDto.lastName },
      );
    });

    it('should throw error when setup token is invalid or expired', async () => {
      auth.hashToken.mockResolvedValue('hashed-setup-token');
      userRepository.findOneBy.mockResolvedValue(null);

      await expect(service.setup(setupDto, setupToken)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when passwords do not match', async () => {
      const invalidDto = { ...setupDto, confirmPassword: 'DifferentPass123!' };

      await expect(service.setup(invalidDto, setupToken)).rejects.toThrow(
        IBadRequestException,
      );
    });
  });

  describe('verifyEmail', () => {
    const verifyEmailDto: VerifyEmailDto = {
      email: 'test@example.com',
      otp: '123456',
    };

    it('should successfully verify email with valid OTP', async () => {
      const unverifiedUser = {
        ...mockUser,
        emailVerified: false,
        emailVerificationOtp: '123456',
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
      };
      userRepository.findOne.mockResolvedValue(unverifiedUser);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({} as any);

      const result = await service.verifyEmail(verifyEmailDto);

      expect(result).toEqual(
        ResponseFormatter.success(
          authSuccessMessages.verifyEmail,
          expect.any(GetUserResponseDTO),
        ),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: unverifiedUser.id },
        {
          emailVerified: true,
          emailVerificationExpires: undefined,
          emailVerificationOtp: undefined,
        },
      );
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(
        KONG_ENVIRONMENT.DEVELOPMENT,
        { custom_id: mockCompany.id },
      );
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when user email is already verified', async () => {
      const verifiedUser = { ...mockUser, emailVerified: true };
      userRepository.findOne.mockResolvedValue(verifiedUser);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when OTP is invalid', async () => {
      const unverifiedUser = {
        ...mockUser,
        emailVerified: false,
        emailVerificationOtp: '654321',
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      };
      userRepository.findOne.mockResolvedValue(unverifiedUser);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        IBadRequestException,
      );
    });

    it('should throw error when OTP is expired', async () => {
      const unverifiedUser = {
        ...mockUser,
        emailVerified: false,
        emailVerificationOtp: '123456',
        emailVerificationExpires: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
      };
      userRepository.findOne.mockResolvedValue(unverifiedUser);

      await expect(service.verifyEmail(verifyEmailDto)).rejects.toThrow(
        IBadRequestException,
      );
    });
  });

  describe('resendOtp', () => {
    const resendOtpDto: ResendOtpDto = {
      email: 'test@example.com',
    };

    it('should successfully resend OTP when user exists and email not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      userRepository.findOne.mockResolvedValue(unverifiedUser);
      userRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockedAuthHelpers.generateOtp.mockReturnValue('654321');

      const result = await service.resendOtp(resendOtpDto);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.resendOtp),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        { email: resendOtpDto.email },
        {
          emailVerificationOtp: '654321',
          emailVerificationExpires: expect.any(Date),
        },
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(AuthEvents.SIGN_UP, expect.objectContaining({
        name: AuthEvents.SIGN_UP,
        author: expect.objectContaining({
          email: mockUser.email,
          id: mockUser.id
        }),
        metadata: expect.objectContaining({
          otp: expect.any(String)
        })
      }));
    });

    it('should return success response when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.resendOtp(resendOtpDto);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.resendOtp),
      );
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should return success response when user email is already verified', async () => {
      const verifiedUser = { ...mockUser, emailVerified: true };
      userRepository.findOne.mockResolvedValue(verifiedUser);

      const result = await service.resendOtp(resendOtpDto);

      expect(result).toEqual(
        ResponseFormatter.success(authSuccessMessages.resendOtp),
      );
      expect(userRepository.update).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
