import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Repository, DataSource } from 'typeorm';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';
import {
  User,
  Company,
  Profile,
  Role,
  Settings,
  TwoFaBackupCode,
  UserStatuses,
} from '@common/database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from '@common/utils/authentication/auth.helper';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { CompanyTypes, ROLES } from '@common/database/constants';
import { getTestDbConfig } from '@test/utils/config/test-db-config';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';
import * as bcryptjs from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let userRepository: Repository<User>;
  let companyRepository: Repository<Company>;
  let profileRepository: Repository<Profile>;
  let roleRepository: Repository<Role>;
  let settingsRepository: Repository<Settings>;
  let eventEmitter: EventEmitter2;
  let configService: ConfigService;
  let authHelper: Auth;
  let kongService: KongConsumerService;

  // Mock Kong service
  const mockKongService = {
    updateOrCreateConsumer: jest.fn().mockResolvedValue({ id: 'consumer-id' }),
  };

  // Mock EventEmitter
  const mockEventEmitter = {
    emit: jest.fn().mockReturnValue(true),
  };

  // Mock ConfigService
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, number> = {
        'auth.defaultOtpExpiresMinutes': 10,
        'auth.minPasswordLength': 8,
        'auth.minPasswordLowercase': 1,
        'auth.minPasswordNumber': 1,
        'auth.minPasswordSpecialCharacter': 1,
        'auth.minPasswordUppercase': 1,
        'auth.minNameLength': 2,
      };
      return config[key];
    }),
  };

  beforeAll(async () => {
    // Setup test module with real database connections
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...getTestDbConfig(),
          entities: [User, Company, Profile, Role, Settings],
        }),
        TypeOrmModule.forFeature([
          User,
          Company,
          Profile,
          Role,
          Settings,
        ]),
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        Auth,
        JwtService,
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: KongConsumerService,
          useValue: mockKongService,
        },
        {
          provide: getRepositoryToken(TwoFaBackupCode),
          useValue: {
            findBy: jest.fn().mockResolvedValue([]),
            softDelete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get repositories and services
    dataSource = moduleFixture.get<DataSource>(DataSource);
    userRepository = moduleFixture.get<Repository<User>>(
      getRepositoryToken(User),
    );
    companyRepository = moduleFixture.get<Repository<Company>>(
      getRepositoryToken(Company),
    );
    profileRepository = moduleFixture.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    roleRepository = moduleFixture.get<Repository<Role>>(
      getRepositoryToken(Role),
    );
    settingsRepository = moduleFixture.get<Repository<Settings>>(
      getRepositoryToken(Settings),
    );
    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
    configService = moduleFixture.get<ConfigService>(ConfigService);
    authHelper = moduleFixture.get<Auth>(Auth);
    kongService = moduleFixture.get<KongConsumerService>(KongConsumerService);
  });

  beforeEach(async () => {
    // Clear all tables
    await profileRepository.clear();
    await userRepository.clear();
    await companyRepository.clear();
    await roleRepository.clear();
    await settingsRepository.clear();

    // Clear all mocks
    jest.clearAllMocks();

    // Setup basic test data that most tests need
    await setupBasicTestData();
  });

  afterAll(async () => {
    if (dataSource) {
      await dataSource.destroy();
    }
    if (app) {
      await app.close();
    }
  });

  async function setupBasicTestData() {
    // Create API consumer role
    const apiConsumerParent = await roleRepository.save({
      name: 'API Consumer',
      slug: ROLES.API_CONSUMER,
      description: 'API Consumer role',
    });

    await roleRepository.save({
      name: 'Admin',
      slug: ROLES.ADMIN,
      description: 'Admin role',
      parent: apiConsumerParent,
    });

    // Create business settings
    await settingsRepository.save({
      name: BUSINESS_SETTINGS_NAME,
      value: JSON.stringify({
        companySubtypes: {
          business: [
            { value: 'technology', default: true },
            { value: 'finance', default: false },
          ],
          'licensed-entity': [
            { value: 'bank', default: true },
            { value: 'fintech', default: false },
          ],
        },
      }),
    });
  }

  function generateValidSignupData(
    companyType: CompanyTypes = CompanyTypes.BUSINESS,
  ): any {
    const baseData = {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: 'Test123!@#',
      confirmPassword: 'Test123!@#',
      phone: '+2348012345678',
      companyType,
    };

    switch (companyType) {
      case CompanyTypes.BUSINESS:
        return {
          ...baseData,
          companyName: faker.company.name(),
          companySubtype: 'technology',
          accountNumber: '1234567890',
          rcNumber: faker.string.alphanumeric(15),
        };
      case CompanyTypes.INDIVIDUAL:
        return {
          ...baseData,
          accountNumber: '1234567890',
          bvn: faker.string.numeric(11),
        };
      case CompanyTypes.LICENSED_ENTITY:
        return {
          ...baseData,
          companyName: faker.company.name(),
          companySubtype: 'bank',
        };
      default:
        return baseData;
    }
  }

  describe('POST /auth/signup', () => {
    describe('when signing up as business', () => {
      describe('with valid data', () => {
        it('should create business user and company successfully', async () => {
          // arrange
          const signupData = generateValidSignupData(CompanyTypes.BUSINESS);

          // act
          const response = await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(201);

          // assert
          expect(response.body).toMatchObject({
            status: 'success',
            message: expect.stringContaining('signup'),
            data: expect.objectContaining({
              email: signupData.email.toLowerCase(),
              profile: expect.objectContaining({
                firstName: signupData.firstName,
                lastName: signupData.lastName,
              }),
              company: expect.objectContaining({
                name: signupData.companyName,
                type: CompanyTypes.BUSINESS,
                subtype: signupData.companySubtype,
              }),
            }),
          });

          // Verify user was created in database
          const createdUser = await userRepository.findOne({
            where: { email: signupData.email.toLowerCase() },
            relations: ['company', 'profile'],
          });
          expect(createdUser).toBeDefined();
          expect(createdUser?.emailVerified).toBe(false);
          expect(createdUser?.status).toBe(UserStatuses.ACTIVE);
        });

        it('should send verification email event', async () => {
          // arrange
          const signupData = generateValidSignupData(CompanyTypes.BUSINESS);

          // act
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(201);

          // assert
          expect(mockEventEmitter.emit).toHaveBeenCalledWith(
            'auth.signup',
            expect.objectContaining({
              user: expect.objectContaining({
                email: signupData.email.toLowerCase(),
              }),
              data: expect.objectContaining({
                otp: expect.any(String),
              }),
            }),
          );
        });

        it('should hash password correctly', async () => {
          // arrange
          const signupData = generateValidSignupData(CompanyTypes.BUSINESS);

          // act
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(201);

          // assert
          const createdUser = await userRepository.findOne({
            where: { email: signupData.email.toLowerCase() },
          });
          expect(createdUser?.password).toBeDefined();
          expect(createdUser?.password).not.toBe(signupData.password);
          expect(
            bcryptjs.compareSync(signupData.password, createdUser?.password!),
          ).toBe(true);
        });
      });

      describe('with invalid data', () => {
        it('should reject when email already exists', async () => {
          // arrange
          const signupData = generateValidSignupData(CompanyTypes.BUSINESS);
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(201);

          // act & assert
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(400)
            .expect((res: any) => {
              expect(res.body).toMatchObject({
                status: 'error',
                message: expect.stringContaining('already exists'),
              });
            });
        });

        it('should reject when RC number already exists', async () => {
          // arrange
          const signupData1 = generateValidSignupData(CompanyTypes.BUSINESS);
          const signupData2 = generateValidSignupData(CompanyTypes.BUSINESS);
          signupData2.rcNumber = signupData1.rcNumber; // Same RC number

          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData1)
            .expect(201);

          // act & assert
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData2)
            .expect(400)
            .expect((res: any) => {
              expect(res.body).toMatchObject({
                status: 'error',
                message: expect.stringContaining('already exists'),
              });
            });
        });

        it('should reject when password mismatch', async () => {
          // arrange
          const signupData = generateValidSignupData(CompanyTypes.BUSINESS);
          signupData.confirmPassword = 'DifferentPassword123!';

          // act & assert
          await request(app.getHttpServer())
            .post('/auth/signup')
            .send(signupData)
            .expect(400)
            .expect((res: any) => {
              expect(res.body).toMatchObject({
                status: 'error',
                message: expect.stringContaining('mismatch'),
              });
            });
        });
      });
    });

    describe('when signing up as individual', () => {
      describe('with valid data', () => {
        it('should create individual user and company successfully', async () => {
          // arrange
          // act
          // assert
        });

        it('should set company name as full name', async () => {
          // arrange
          // act
          // assert
        });
      });

      describe('with invalid data', () => {
        it('should reject when BVN already exists', async () => {
          // arrange
          // act
          // assert
        });

        it('should validate BVN format', async () => {
          // arrange
          // act
          // assert
        });
      });
    });

    describe('when signing up as licensed entity', () => {
      describe('with valid data', () => {
        it('should create licensed entity user and company successfully', async () => {
          // arrange
          // act
          // assert
        });
      });

      describe('with invalid data', () => {
        it('should reject when invalid company subtype', async () => {
          // arrange
          // act
          // assert
        });
      });
    });

    describe('when API consumer role not found', () => {
      it('should return error', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;
    let testCompany: any;

    beforeEach(() => {
      // Setup verified user and active company
    });

    describe('when credentials are valid', () => {
      it('should return access and refresh tokens', async () => {
        // arrange
        // act
        // assert
      });

      it('should update last login timestamp', async () => {
        // arrange
        // act
        // assert
      });

      it('should emit login event', async () => {
        // arrange
        // act
        // assert
      });

      it('should indicate first login correctly', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when credentials are invalid', () => {
      it('should reject with wrong email', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject with wrong password', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when user email not verified', () => {
      it('should reject login attempt', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when company is inactive', () => {
      it('should reject login attempt', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when user is inactive', () => {
      it('should reject login attempt', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when 2FA is enabled', () => {
      beforeEach(() => {
        // Setup user with 2FA enabled
      });

      it('should require 2FA code when not provided', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/login/two-fa', () => {
    let testUser: any;

    beforeEach(() => {
      // Setup user with 2FA enabled
    });

    describe('when using TOTP code', () => {
      it('should login successfully with valid TOTP', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject invalid TOTP code', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when using backup code', () => {
      it('should login successfully with valid backup code', async () => {
        // arrange
        // act
        // assert
      });

      it('should remove used backup code', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject invalid backup code', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/token', () => {
    let testUser: any;
    let validRefreshToken: string;

    beforeEach(() => {
      // Setup user with valid refresh token
    });

    describe('when refresh token is valid', () => {
      it('should return new access and refresh tokens', async () => {
        // arrange
        // act
        // assert
      });

      it('should increment token count', async () => {
        // arrange
        // act
        // assert
      });

      it('should update last login timestamp', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when refresh token is invalid', () => {
      it('should reject malformed token', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject expired token', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject token with wrong user ID', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when token count exceeds limit', () => {
      it('should reject token refresh', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/email/verify', () => {
    let testUser: any;
    let validOtp: string;

    beforeEach(() => {
      // Setup user with pending email verification
    });

    describe('when OTP is valid', () => {
      it('should verify email successfully', async () => {
        // arrange
        // act
        // assert
      });

      it('should create Kong consumer for development', async () => {
        // arrange
        // act
        // assert
      });

      it('should clear OTP fields', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when OTP is invalid', () => {
      it('should reject wrong OTP', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject expired OTP', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject for non-existent user', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when email already verified', () => {
      it('should reject verification attempt', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/otp/resend', () => {
    let testUser: any;

    beforeEach(() => {
      // Setup user with pending email verification
    });

    describe('when user exists and email not verified', () => {
      it('should generate and send new OTP', async () => {
        // arrange
        // act
        // assert
      });

      it('should update OTP expiry time', async () => {
        // arrange
        // act
        // assert
      });

      it('should emit resend OTP event', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when user does not exist', () => {
      it('should return success without action', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when email already verified', () => {
      it('should return success without action', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/password/forgot', () => {
    let testUser: any;

    beforeEach(() => {
      // Setup test user
    });

    describe('when user exists', () => {
      it('should generate reset token and send email', async () => {
        // arrange
        // act
        // assert
      });

      it('should set reset token expiry', async () => {
        // arrange
        // act
        // assert
      });

      it('should emit forgot password event', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when user does not exist', () => {
      it('should return success without action', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/password/reset/:resetToken', () => {
    let testUser: any;
    let validResetToken: string;

    beforeEach(() => {
      // Setup user with valid reset token
    });

    describe('when reset token is valid', () => {
      it('should reset password successfully', async () => {
        // arrange
        // act
        // assert
      });

      it('should clear reset token fields', async () => {
        // arrange
        // act
        // assert
      });

      it('should verify email if not already verified', async () => {
        // arrange
        // act
        // assert
      });

      it('should emit password reset event', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when reset token is invalid', () => {
      it('should reject expired token', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject malformed token', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when password validation fails', () => {
      it('should reject password mismatch', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject same old password', async () => {
        // arrange
        // act
        // assert
      });
    });
  });

  describe('POST /auth/setup/:token', () => {
    let testUser: any;
    let validSetupToken: string;

    beforeEach(() => {
      // Setup user with valid setup token
    });

    describe('when setup token is valid', () => {
      it('should complete user setup successfully', async () => {
        // arrange
        // act
        // assert
      });

      it('should update user profile', async () => {
        // arrange
        // act
        // assert
      });

      it('should activate user account', async () => {
        // arrange
        // act
        // assert
      });

      it('should verify email', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when setup token is invalid', () => {
      it('should reject expired token', async () => {
        // arrange
        // act
        // assert
      });

      it('should reject malformed token', async () => {
        // arrange
        // act
        // assert
      });
    });

    describe('when password validation fails', () => {
      it('should reject password mismatch', async () => {
        // arrange
        // act
        // assert
      });
    });
  });
});
