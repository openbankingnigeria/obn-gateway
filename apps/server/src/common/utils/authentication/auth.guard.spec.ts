import { authErrors } from '@auth/auth.errors';
import { CompanyTypes } from '@common/database/constants';
import {
  Company,
  CompanyStatuses,
  Permission,
  Role,
  User,
  UserStatuses,
} from '@common/database/entities';
import { CompanyTiers } from '@company/types';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CompanyBuilder,
  PermissionBuilder,
  RoleBuilder,
  UserBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import moment from 'moment';
import * as speakeasy from 'speakeasy';
import { PERMISSIONS } from 'src/permissions/types';
import {
  IBadRequestException,
  IForbiddenException,
  IPreconditionFailedException,
  IUnauthorizedException,
} from '../exceptions/exceptions';
import { RequestContext } from '../request/request-context';
import {
  REQUIRE_TWO_FA_KEY,
  REQUIRED_PERMISSION_METADATA_KEY,
  SKIP_AUTH_METADATA_KEY,
} from './auth.decorator';
import { AuthGuard } from './auth.guard';
import { Auth } from './auth.helper';

// Mock external modules
jest.mock('speakeasy');
jest.mock('moment');

const mockedSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>;
const mockedMoment = moment as jest.Mocked<typeof moment>;

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: jest.Mocked<Reflector>;
  let auth: jest.Mocked<Auth>;
  let userRepository: MockRepository<User>;

  // Test data builders
  let mockUser: User;
  let mockCompany: Company;
  let mockRole: Role;
  let mockParentRole: Role;
  let mockPermission: Permission;

  // Mock execution context
  let mockExecutionContext: jest.Mocked<ExecutionContext>;
  let mockRequest: any;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = createMockRepository<User>();

    // Initialize service mocks
    reflector = {
      get: jest.fn(),
    } as any;

    auth = {
      verify: jest.fn(),
    } as any;

    // Build test entities
    mockPermission = new PermissionBuilder()
      .with('id', 'permission-id')
      .with('slug', PERMISSIONS.VIEW_PROFILE)
      .build();

    mockParentRole = new RoleBuilder()
      .with('id', 'parent-role-id')
      .with('slug', 'api-consumer')
      .with('permissions', [mockPermission])
      .build();

    mockRole = new RoleBuilder()
      .with('id', 'role-id')
      .with('slug', 'user')
      .with('parentId', mockParentRole.id!)
      .with('parent', mockParentRole)
      .with('permissions', [mockPermission])
      .build();

    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.BUSINESS)
      .with('tier', CompanyTiers.TIER_0)
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('emailVerified', true)
      .with('roleId', mockRole.id!)
      .with('role', mockRole)
      .with('companyId', mockCompany.id!)
      .with('company', mockCompany)
      .with('lastLogin', new Date())
      .with('twofaEnabled', false)
      .build();

    // Mock request object
    mockRequest = {
      headers: {},
      get: jest.fn(),
      ctx: null,
    };

    // Mock execution context
    mockExecutionContext = {
      getHandler: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as any;

    // Setup default mock implementations
    (mockedMoment as any).mockImplementation(() => ({
      isSame: jest.fn().mockReturnValue(true),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflector },
        { provide: Auth, useValue: auth },
        { provide: 'UserRepository', useValue: userRepository },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      reflector.get.mockImplementation((key: any) => {
        if (key === SKIP_AUTH_METADATA_KEY) return false;
        if (key === REQUIRED_PERMISSION_METADATA_KEY) return undefined;
        if (key === REQUIRE_TWO_FA_KEY) return undefined;
        return undefined;
      });
    });

    describe('when authentication should be skipped', () => {
      it('should return true when SkipAuthGuard decorator is applied', async () => {
        reflector.get.mockImplementation((key: any) => {
          if (key === SKIP_AUTH_METADATA_KEY) return true;
          return undefined;
        });

        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(auth.verify).toHaveBeenCalledTimes(0);
        expect(userRepository.findOne).toHaveBeenCalledTimes(0);
      });
    });

    describe('when access token is not provided', () => {
      it('should throw UnauthorizedException when no authorization header', async () => {
        mockRequest.headers = {};

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.accessTokenNotProvided,
        );
      });

      it('should throw UnauthorizedException when authorization header is empty', async () => {
        mockRequest.headers = { authorization: '' };

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
      });

      it('should throw UnauthorizedException when authorization header has no Bearer token', async () => {
        mockRequest.headers = { authorization: 'InvalidFormat token' };

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
      });
    });

    describe('when access token is invalid', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };
      });

      it('should throw UnauthorizedException when token verification fails', async () => {
        auth.verify.mockRejectedValue(new Error('Invalid token'));

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.invalidCredentials,
        );
      });

      it('should throw UnauthorizedException when decoded token has no id', async () => {
        auth.verify.mockResolvedValue({} as any);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.invalidCredentials,
        );
      });
    });

    describe('when user is not found or invalid', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        auth.verify.mockResolvedValue({ id: 'user-id', iat: 1234567890 });
      });

      it('should throw UnauthorizedException when user not found', async () => {
        userRepository.findOne.mockResolvedValue(null);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.invalidCredentials,
        );
      });

      it('should throw UnauthorizedException when user has no company', async () => {
        const userWithoutCompany = { ...mockUser, company: undefined };
        userRepository.findOne.mockResolvedValue(userWithoutCompany);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
      });
    });

    describe('when token timestamp validation fails', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        auth.verify.mockResolvedValue({ id: 'user-id', iat: 1234567890 });
        userRepository.findOne.mockResolvedValue(mockUser);
      });

      it('should throw UnauthorizedException when lastLogin does not match token timestamp', async () => {
        (mockedMoment as any).mockImplementation(() => ({
          isSame: jest.fn().mockReturnValue(false),
        }));

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IUnauthorizedException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.invalidCredentials,
        );
      });
    });

    describe('when permission validation fails', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        auth.verify.mockResolvedValue({ id: 'user-id', iat: 1234567890 });
        userRepository.findOne.mockResolvedValue(mockUser);
      });

      it('should throw ForbiddenException when user lacks required permission', async () => {
        reflector.get.mockImplementation((key: any) => {
          if (key === REQUIRED_PERMISSION_METADATA_KEY)
            return PERMISSIONS.LIST_API_CONSUMERS;
          return undefined;
        });

        jest
          .spyOn(RequestContext.prototype, 'hasPermission')
          .mockReturnValue(false);

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          IForbiddenException,
        );
        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
          authErrors.inadequatePermissions(PERMISSIONS.LIST_API_CONSUMERS),
        );
      });
    });

    describe('when 2FA is required', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        auth.verify.mockResolvedValue({ id: 'user-id', iat: 1234567890 });
        userRepository.findOne.mockResolvedValue(mockUser);
        jest
          .spyOn(RequestContext.prototype, 'hasPermission')
          .mockReturnValue(true);
      });

      describe('strict 2FA requirement', () => {
        beforeEach(() => {
          reflector.get.mockImplementation((key: any) => {
            if (key === REQUIRE_TWO_FA_KEY) return true;
            return undefined;
          });
        });

        it('should throw BadRequestException when 2FA code is not provided', async () => {
          mockRequest.get.mockReturnValue(undefined);

          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            IBadRequestException,
          );
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            authErrors.twoFARequired,
          );
        });

        it('should throw PreconditionFailedException when user has 2FA disabled', async () => {
          const userWithoutTwoFA = { ...mockUser, twofaEnabled: false };
          userRepository.findOne.mockResolvedValue(userWithoutTwoFA);
          mockRequest.get.mockReturnValue('123456');

          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            IPreconditionFailedException,
          );
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            authErrors.twoFARequired,
          );
        });
      });

      describe('optional 2FA requirement', () => {
        beforeEach(() => {
          reflector.get.mockImplementation((key: any) => {
            if (key === REQUIRE_TWO_FA_KEY) return false;
            return undefined;
          });
        });

        it('should throw BadRequestException when user has 2FA enabled but code not provided', async () => {
          const userWithTwoFA = {
            ...mockUser,
            twofaEnabled: true,
            twofaSecret: 'secret',
          };
          userRepository.findOne.mockResolvedValue(userWithTwoFA);
          mockRequest.get.mockReturnValue(undefined);

          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            IBadRequestException,
          );
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            authErrors.provideTwoFA,
          );
        });
      });

      describe('2FA code validation', () => {
        beforeEach(() => {
          reflector.get.mockImplementation((key: any) => {
            if (key === REQUIRE_TWO_FA_KEY) return true;
            return undefined;
          });
        });

        it('should successfully validate with correct 2FA code', async () => {
          const userWithTwoFA = {
            ...mockUser,
            twofaEnabled: true,
            twofaSecret: 'secret',
          };
          userRepository.findOne.mockResolvedValue(userWithTwoFA);
          mockRequest.get.mockReturnValue('123456');
          (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(true);

          const result = await guard.canActivate(mockExecutionContext);

          expect(result).toBe(true);
          expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledTimes(1);
          expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledWith({
            secret: 'secret',
            encoding: 'base32',
            token: '123456',
          });
        });

        it('should throw BadRequestException when 2FA code is invalid', async () => {
          const userWithTwoFA = {
            ...mockUser,
            twofaEnabled: true,
            twofaSecret: 'secret',
          };
          userRepository.findOne.mockResolvedValue(userWithTwoFA);
          mockRequest.get.mockReturnValue('123456');
          (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(false);

          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            IBadRequestException,
          );
          await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
            authErrors.invalidTwoFA,
          );
        });
      });
    });

    describe('when all validations pass', () => {
      beforeEach(() => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };
        auth.verify.mockResolvedValue({ id: 'user-id', iat: 1234567890 });
        userRepository.findOne.mockResolvedValue(mockUser);
        jest
          .spyOn(RequestContext.prototype, 'hasPermission')
          .mockReturnValue(true);
      });

      it('should return true and set request context', async () => {
        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(mockRequest.ctx).toBeInstanceOf(RequestContext);
        expect(mockRequest.ctx.activeUser).toEqual(mockUser);
      });

      it('should handle valid token with required permission', async () => {
        reflector.get.mockImplementation((key: any) => {
          if (key === REQUIRED_PERMISSION_METADATA_KEY)
            return PERMISSIONS.VIEW_PROFILE;
          return undefined;
        });

        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(userRepository.findOne).toHaveBeenCalledTimes(1);
        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: expect.anything(),
            role: { parentId: expect.anything() },
          },
          relations: {
            role: {
              permissions: true,
              parent: { permissions: true },
            },
            company: true,
          },
        });
      });

      it('should handle valid token without 2FA when not required', async () => {
        const result = await guard.canActivate(mockExecutionContext);

        expect(result).toBe(true);
        expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledTimes(0);
      });
    });
  });
});
