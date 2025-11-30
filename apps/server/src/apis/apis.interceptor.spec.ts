import { CompanyTypes } from '@common/database/constants';
import { IRequest } from '@common/utils/authentication/auth.types';
import {
    IForbiddenException,
    INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { RequestContext } from '@common/utils/request/request-context';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { of } from 'rxjs';
import { APIInterceptor } from './apis.interceptor';

describe('APIInterceptor', () => {
  let interceptor: APIInterceptor;
  let configService: jest.Mocked<ConfigService>;

  const createMockRequestContext = (company: any): RequestContext => ({
    activeCompany: company,
    activeUser: {
      id: 'test-user-id',
      email: 'test@example.com',
      companyId: company.id || 'test-company-id',
      roleId: 'test-role-id',
      status: 'active',
      emailVerified: true,
      twofaEnabled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    activeUserType: 'user',
    options: {},
    copy: jest.fn(),
    hasPermission: jest.fn().mockReturnValue(true),
  } as any);

  const mockExecutionContext = (request: Partial<IRequest>): ExecutionContext => ({
    switchToHttp: () => ({
      getRequest: () => request as IRequest,
    }),
  } as ExecutionContext);

  const mockCallHandler = (value: any = 'test-response'): CallHandler => ({
    handle: () => of(value),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        APIInterceptor,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'kong.adminEndpoint') {
                return {
                  [KONG_ENVIRONMENT.DEVELOPMENT]: 'https://kong-development.admin',
                  [KONG_ENVIRONMENT.PRODUCTION]: 'https://kong-production.admin',
                };
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    interceptor = module.get<APIInterceptor>(APIInterceptor);
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Development Environment', () => {
    it('should allow access to DEVELOPMENT environment for any company', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.DEVELOPMENT },
        ctx: createMockRequestContext({
          isVerified: false,
          kybStatus: 'pending',
          type: CompanyTypes.LICENSED_ENTITY,
        }),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toBe('test-response'),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });

    it('should allow access to DEVELOPMENT environment for unverified API_PROVIDER', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.DEVELOPMENT },
        ctx: createMockRequestContext({
          isVerified: false,
          kybStatus: 'pending',
          type: CompanyTypes.API_PROVIDER,
        }),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toBe('test-response'),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });
  });

  describe('Non-Development Environments', () => {
    const nonDevEnvironments = [KONG_ENVIRONMENT.PRODUCTION];

    it.each(nonDevEnvironments)(
      'should allow access to %s environment for verified and approved API_CONSUMER',
      (environment) => {
        const request = {
          params: { environment },
          ctx: createMockRequestContext({
            isVerified: true,
            kybStatus: 'approved',
            type: CompanyTypes.BUSINESS,
          }),
        };

        const context = mockExecutionContext(request);
        const next = mockCallHandler();

        const result = interceptor.intercept(context, next);

        result.subscribe({
          next: (value) => expect(value).toBe('test-response'),
          error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
        });
      },
    );

    it.each(nonDevEnvironments)(
      'should allow access to %s environment for API_PROVIDER regardless of verification status',
      (environment) => {
        const request = {
          params: { environment },
          ctx: createMockRequestContext({
            isVerified: false,
            kybStatus: 'pending',
            type: CompanyTypes.API_PROVIDER,
          }),
        };

        const context = mockExecutionContext(request);
        const next = mockCallHandler();

        const result = interceptor.intercept(context, next);

        result.subscribe({
          next: (value) => expect(value).toBe('test-response'),
          error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
        });
      },
    );

    it.each(nonDevEnvironments)(
      'should deny access to %s environment for unverified API_CONSUMER',
      (environment) => {
        const request = {
          params: { environment },
          ctx: createMockRequestContext({
            isVerified: false,
            kybStatus: 'pending',
            type: CompanyTypes.INDIVIDUAL,
          }),
        };

        const context = mockExecutionContext(request);
        const next = mockCallHandler();

        const result = interceptor.intercept(context, next);

        result.subscribe({
          next: () => { throw new Error('Should have thrown forbidden error'); },
          error: (error) => {
            expect(error).toBeInstanceOf(IForbiddenException);
            expect(error.message).toBe('Cannot access this environment');
          },
        });
      },
    );

    it.each(nonDevEnvironments)(
      'should deny access to %s environment for verified but not approved API_CONSUMER',
      (environment) => {
        const request = {
          params: { environment },
          ctx: createMockRequestContext({
            isVerified: true,
            kybStatus: 'pending',
            type: CompanyTypes.INDIVIDUAL,
          }),
        };

        const context = mockExecutionContext(request);
        const next = mockCallHandler();

        const result = interceptor.intercept(context, next);

        result.subscribe({
          next: () => { throw new Error('Should have thrown forbidden error'); },
          error: (error) => {
            expect(error).toBeInstanceOf(IForbiddenException);
            expect(error.message).toBe('Cannot access this environment');
          },
        });
      },
    );

    it.each(nonDevEnvironments)(
      'should deny access to %s environment for approved but not verified API_CONSUMER',
      (environment) => {
        const request = {
          params: { environment },
          ctx: createMockRequestContext({
            isVerified: false,
            kybStatus: 'approved',
            type: CompanyTypes.LICENSED_ENTITY,
          }),
        };

        const context = mockExecutionContext(request);
        const next = mockCallHandler();

        const result = interceptor.intercept(context, next);

        result.subscribe({
          next: () => { throw new Error('Should have thrown forbidden error'); },
          error: (error) => {
            expect(error).toBeInstanceOf(IForbiddenException);
            expect(error.message).toBe('Cannot access this environment');
          },
        });
      },
    );
  });

  describe('Environment Configuration', () => {
    it('should throw NotFoundException when environment admin endpoint is not configured', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'kong.adminEndpoint') {
          return { [KONG_ENVIRONMENT.DEVELOPMENT]: 'https://kong-development.admin' };
        }
        return null;
      });

      const request = {
        params: { environment: KONG_ENVIRONMENT.PRODUCTION },
        ctx: createMockRequestContext({
          isVerified: true,
          kybStatus: 'approved',
          type: CompanyTypes.BUSINESS,
        }),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: () => { throw new Error('Should have thrown not found error'); },
        error: (error) => {
          expect(error).toBeInstanceOf(INotFoundException);
          expect(error.message).toBe('Environment does not exist');
        },
      });
    });

    it('should allow access when environment admin endpoint is configured', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.PRODUCTION },
        ctx: createMockRequestContext({
          isVerified: true,
          kybStatus: 'approved',
          type: CompanyTypes.BUSINESS,
        }),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toBe('test-response'),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle API_PROVIDER with null verification status in non-dev environment', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.PRODUCTION },
        ctx: createMockRequestContext({
          isVerified: null,
          kybStatus: null,
          type: CompanyTypes.API_PROVIDER,
        }),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toBe('test-response'),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });

    it('should handle missing company properties gracefully', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.DEVELOPMENT },
        ctx: createMockRequestContext({} as any),
      };

      const context = mockExecutionContext(request);
      const next = mockCallHandler();

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toBe('test-response'),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });

    it('should pass through the response from the next handler', () => {
      const request = {
        params: { environment: KONG_ENVIRONMENT.DEVELOPMENT },
        ctx: createMockRequestContext({
          isVerified: false,
          kybStatus: 'pending',
          type: CompanyTypes.INDIVIDUAL,
        }),
      };

      const context = mockExecutionContext(request);
      const customResponse = { data: 'custom-response-data' };
      const next = mockCallHandler(customResponse);

      const result = interceptor.intercept(context, next);

      result.subscribe({
        next: (value) => expect(value).toEqual(customResponse),
        error: (error) => { throw new Error(`Should not throw error: ${error.message}`); },
      });
    });
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});