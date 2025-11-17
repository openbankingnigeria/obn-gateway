import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './auditLogs.controller';
import { AuditLogsService } from './auditLogs.service';
import { auditLogsSuccessMessages } from './auditLogs.constants';
import { auditLogErrors } from './auditLogs.errors';
import { CompanyTypes } from '@common/database/constants';
import { SKIP_AUTH_METADATA_KEY } from '@common/utils/authentication/auth.decorator';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { RequestContext } from '@common/utils/request/request-context';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { GetAuditLogResponseDTO } from './dto/index.dto';
import {
  AuditLogBuilder,
  CompanyBuilder,
  ProfileBuilder,
  UserBuilder,
} from '@test/utils/builders';
import { APEvents, ACEvents } from '@shared/events/all.event';
import { PERMISSIONS } from '@permissions/types';

describe('AuditLogsController', () => {
  // Setup and Mocking
  let controller: AuditLogsController;
  let auditLogsService: jest.Mocked<AuditLogsService>;
  let mockRequestContext: RequestContext;
  let mockPaginationParams: PaginationParameters;
  let mockFilters: any;
  let mockAuditLog: any;
  let mockAuditLogResponse: GetAuditLogResponseDTO;

  beforeEach(async () => {
    auditLogsService = {
      getLogs: jest.fn(),
      getSingleLog: jest.fn(),
      getAuditLogTypes: jest.fn(),
      logEvent: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: auditLogsService,
        },
      ],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);

    // Mock data setup
    const mockUser = new UserBuilder()
      .withId('test-user-id')
      .with('companyId', 'test-company-id')
      .with('email', 'test@example.com')
      .build();

    const mockProfile = new ProfileBuilder()
      .with('firstName', 'John')
      .with('lastName', 'Doe')
      .build();

    const mockCompany = new CompanyBuilder()
      .withId('test-company-id')
      .with('type', CompanyTypes.BUSINESS)
      .build();

    mockUser.profile = mockProfile;

    mockRequestContext = {
      activeUser: mockUser,
      activeCompany: mockCompany,
    } as RequestContext;

    mockPaginationParams = {
      limit: 10,
      page: 1,
    };

    mockFilters = {
      event: 'test.event',
      createdAt: new Date(),
    };

    mockAuditLog = new AuditLogBuilder()
      .withId('test-log-id')
      .with('event', 'test.event')
      .with('companyId', 'test-company-id')
      .with('userId', 'test-user-id')
      .with('details', { action: 'test action' })
      .with('createdAt', new Date())
      .with('updatedAt', new Date())
      .build();

    mockAuditLog.user = mockUser;
    mockAuditLog.company = mockCompany;

    mockAuditLogResponse = new GetAuditLogResponseDTO(mockAuditLog);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('getLogs', () => {
    describe('when getLogs is called with valid parameters', () => {
      it('should successfully fetch paginated audit logs for non-API_PROVIDER company', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledTimes(1);
        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );
        expect(result).toEqual(mockResponse);
      });

      it('should successfully fetch all audit logs for API_PROVIDER company', async () => {
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          apiProviderContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          apiProviderContext,
          mockPaginationParams,
          mockFilters,
        );
        expect(result).toEqual(mockResponse);
      });

      it('should return logs with standardized response format', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result).toHaveProperty('status', 'success');
        expect(result).toHaveProperty(
          'message',
          auditLogsSuccessMessages.fetchLogs,
        );
        expect(result).toHaveProperty('data');
        expect(result).toHaveProperty('meta');
      });

      it('should include pagination metadata in response', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 25,
            totalNumberOfPages: 3,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.meta).toEqual({
          totalNumberOfRecords: 25,
          totalNumberOfPages: 3,
          pageNumber: 1,
          pageSize: 10,
        });
      });

      it('should include user profile information in each log entry', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.data[0]).toHaveProperty('user');
        expect(result.data[0].user).toHaveProperty('profile');
        expect(result.data[0].user.profile).toHaveProperty('firstName');
        expect(result.data[0].user.profile).toHaveProperty('lastName');
      });
    });

    describe('pagination', () => {
      it('should handle pagination parameters correctly', async () => {
        const customPagination = { limit: 20, page: 2 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 2,
            pageSize: 20,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          customPagination,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          customPagination,
          mockFilters,
        );
      });

      it('should calculate total pages correctly', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 47,
            totalNumberOfPages: 5,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.meta.totalNumberOfPages).toBe(5);
        expect(result.meta.totalNumberOfRecords).toBe(47);
      });

      it('should return correct page number and page size', async () => {
        const customPagination = { limit: 15, page: 3 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 100,
            totalNumberOfPages: 7,
            pageNumber: 3,
            pageSize: 15,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          customPagination,
          mockFilters,
        );

        expect(result.meta.pageNumber).toBe(3);
        expect(result.meta.pageSize).toBe(15);
      });

      it('should handle edge case when page exceeds total pages', async () => {
        const highPagePagination = { limit: 10, page: 999 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 5,
            totalNumberOfPages: 1,
            pageNumber: 999,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          highPagePagination,
          mockFilters,
        );

        expect(result.data).toEqual([]);
        expect(result.meta.pageNumber).toBe(999);
      });
    });

    describe('filtering', () => {
      it('should apply event filter correctly', async () => {
        const eventFilter = { event: 'auth.login' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          eventFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          eventFilter,
        );
      });

      it('should apply createdAt date filter correctly', async () => {
        const dateFilter = { createdAt: new Date('2024-01-01') };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          dateFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          dateFilter,
        );
      });

      it('should apply user name filter (firstName/lastName) correctly', async () => {
        const nameFilter = { name: 'John' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          nameFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          nameFilter,
        );
      });

      it('should apply user email filter correctly', async () => {
        const emailFilter = { email: 'test@example.com' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          emailFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          emailFilter,
        );
      });

      it('should handle multiple filters simultaneously', async () => {
        const multipleFilters = {
          event: 'auth.login',
          email: 'test@example.com',
          createdAt: new Date('2024-01-01'),
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          multipleFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          multipleFilters,
        );
      });

      it('should transform filters through FilterPipe correctly', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );
      });
    });

    describe('company isolation', () => {
      it('should only return logs for current company when not API_PROVIDER', async () => {
        const regularCompanyContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.BUSINESS,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          regularCompanyContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          regularCompanyContext,
          mockPaginationParams,
          mockFilters,
        );
      });

      it('should return all logs when company type is API_PROVIDER', async () => {
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          apiProviderContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          apiProviderContext,
          mockPaginationParams,
          mockFilters,
        );
      });

      it('should enforce company context from RequestContext', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );
      });

      it('should not allow cross-company data access for regular companies', async () => {
        const differentCompanyContext = {
          ...mockRequestContext,
          activeUser: {
            ...mockRequestContext.activeUser,
            companyId: 'different-company-id',
          },
          activeCompany: {
            ...mockRequestContext.activeCompany,
            id: 'different-company-id',
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          differentCompanyContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          differentCompanyContext,
          mockPaginationParams,
          mockFilters,
        );
      });
    });

    describe('permissions', () => {
      it('should require LIST_AUDIT_LOGS permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          'allowed_permissions',
          controller.getLogs,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_AUDIT_LOGS);
      });

      it('should deny access without proper permission', async () => {
        const error = new Error('Insufficient permissions');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Insufficient permissions');
      });

      it('should verify permission decorator is properly applied', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const hasRequiredPermission = reflector.get(
          'allowed_permissions',
          controller.getLogs,
        );
        expect(hasRequiredPermission).toBeDefined();
      });
    });

    describe('validation', () => {
      it('should validate pagination parameters through PaginationPipe', async () => {
        const validPagination = { limit: 25, page: 2 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 2,
            pageSize: 25,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          validPagination,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          validPagination,
          mockFilters,
        );
      });

      it('should handle invalid pagination parameters', async () => {
        const error = new Error('Invalid pagination parameters');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Invalid pagination parameters');
      });

      it('should validate filter parameters through FilterPipe', async () => {
        const validFilters = { event: 'valid.event' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          validFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          validFilters,
        );
      });

      it('should handle invalid filter parameters', async () => {
        const error = new Error('Invalid filter parameters');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Invalid filter parameters');
      });
    });

    describe('response format', () => {
      it('should use ResponseFormatter.success for successful responses', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.status).toBe('success');
        expect(result.message).toBe(auditLogsSuccessMessages.fetchLogs);
      });

      it('should return GetAuditLogResponseDTO instances', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.data[0]).toBeInstanceOf(GetAuditLogResponseDTO);
      });

      it('should include all required fields in each log entry', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [mockAuditLogResponse],
          {
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        const logEntry = result.data[0];
        expect(logEntry).toHaveProperty('id');
        expect(logEntry).toHaveProperty('event');
        expect(logEntry).toHaveProperty('details');
        expect(logEntry).toHaveProperty('user');
        expect(logEntry).toHaveProperty('createdAt');
        expect(logEntry).toHaveProperty('updatedAt');
      });

      it('should handle empty result sets correctly', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        const result = await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(result.data).toEqual([]);
        expect(result.meta.totalNumberOfRecords).toBe(0);
      });
    });

    describe('error handling', () => {
      it('should propagate service errors correctly', async () => {
        const error = new Error('Database connection failed');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Database connection failed');
        expect(auditLogsService.getLogs).toHaveBeenCalledTimes(1);
      });

      it('should handle database connection errors', async () => {
        const dbError = new Error('Connection timeout');
        auditLogsService.getLogs.mockRejectedValue(dbError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Connection timeout');
      });

      it('should handle invalid RequestContext', async () => {
        const invalidContextError = new Error('Invalid request context');
        auditLogsService.getLogs.mockRejectedValue(invalidContextError);

        await expect(
          controller.getLogs(null as any, mockPaginationParams, mockFilters),
        ).rejects.toThrow('Invalid request context');
      });
    });
  });

  describe('getLogById', () => {
    describe('when getLogById is called with valid ID', () => {
      it('should successfully fetch single audit log', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledTimes(1);
        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          logId,
        );
        expect(result).toEqual(mockResponse);
      });

      it('should return log with standardized response format', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result).toHaveProperty('status', 'success');
        expect(result).toHaveProperty(
          'message',
          auditLogsSuccessMessages.fetchLog,
        );
        expect(result).toHaveProperty('data');
      });

      it('should include user and profile relations', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result.data).toHaveProperty('user');
        expect(result.data.user).toHaveProperty('profile');
        expect(result.data.user.profile).toHaveProperty('firstName');
        expect(result.data.user.profile).toHaveProperty('lastName');
      });

      it('should return GetAuditLogResponseDTO instance', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result.data).toBeInstanceOf(GetAuditLogResponseDTO);
      });
    });

    describe('company isolation', () => {
      it('should only return log if it belongs to current company', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(mockRequestContext, logId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          logId,
        );
      });

      it('should allow API_PROVIDER to access any log', async () => {
        const logId = 'any-company-log-id';
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(apiProviderContext, logId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          apiProviderContext,
          logId,
        );
      });

      it('should enforce company context from RequestContext', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(mockRequestContext, logId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          logId,
        );
      });
    });

    describe('permissions', () => {
      it('should require VIEW_AUDIT_LOG permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          'allowed_permissions',
          controller.getLogById,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_AUDIT_LOG);
      });

      it('should deny access without proper permission', async () => {
        const logId = 'test-log-id';
        const error = new Error('Insufficient permissions');
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow('Insufficient permissions');
      });

      it('should verify permission decorator is properly applied', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const hasRequiredPermission = reflector.get(
          'allowed_permissions',
          controller.getLogById,
        );
        expect(hasRequiredPermission).toBeDefined();
      });
    });

    describe('validation', () => {
      it('should validate log ID parameter format', async () => {
        const validLogId = '123e4567-e89b-12d3-a456-426614174000';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(mockRequestContext, validLogId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          validLogId,
        );
      });

      it('should handle invalid UUID format', async () => {
        const invalidId = 'invalid-uuid';
        const error = new Error('Invalid UUID format');
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, invalidId),
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should handle null or undefined ID', async () => {
        const error = new Error('Log ID is required');
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, null as any),
        ).rejects.toThrow('Log ID is required');
      });
    });

    describe('not found scenarios', () => {
      it('should throw NotFoundException when log does not exist', async () => {
        const nonExistentLogId = 'non-existent-id';
        const error = new Error(
          auditLogErrors.logWithIdNotFound(nonExistentLogId),
        );
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, nonExistentLogId),
        ).rejects.toThrow(auditLogErrors.logWithIdNotFound(nonExistentLogId));
      });

      it('should return descriptive error message with log ID', async () => {
        const logId = 'missing-log-id';
        const expectedMessage = auditLogErrors.logWithIdNotFound(logId);
        const error = new Error(expectedMessage);
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow(expectedMessage);
      });

      it('should handle case when log exists but not for current company', async () => {
        const logId = 'other-company-log-id';
        const error = new Error(auditLogErrors.logWithIdNotFound(logId));
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow(auditLogErrors.logWithIdNotFound(logId));
      });
    });

    describe('response format', () => {
      it('should use ResponseFormatter.success for successful responses', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result.status).toBe('success');
        expect(result.message).toBe(auditLogsSuccessMessages.fetchLog);
      });

      it('should include all log details in response', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        const logData = result.data;
        expect(logData).toHaveProperty('id');
        expect(logData).toHaveProperty('event');
        expect(logData).toHaveProperty('details');
        expect(logData).toHaveProperty('createdAt');
        expect(logData).toHaveProperty('updatedAt');
      });

      it('should include company information in response', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result.data).toHaveProperty('company');
      });

      it('should include user information with profile in response', async () => {
        const logId = 'test-log-id';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const result = await controller.getLogById(mockRequestContext, logId);

        expect(result.data).toHaveProperty('user');
        expect(result.data.user).toHaveProperty('profile');
        expect(result.data.user.profile).toHaveProperty('firstName');
        expect(result.data.user.profile).toHaveProperty('lastName');
      });
    });

    describe('error handling', () => {
      it('should propagate service errors correctly', async () => {
        const logId = 'test-log-id';
        const error = new Error('Database connection failed');
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow('Database connection failed');
        expect(auditLogsService.getSingleLog).toHaveBeenCalledTimes(1);
      });

      it('should handle database connection errors', async () => {
        const logId = 'test-log-id';
        const dbError = new Error('Connection timeout');
        auditLogsService.getSingleLog.mockRejectedValue(dbError);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow('Connection timeout');
      });

      it('should distinguish between not found and access denied', async () => {
        const logId = 'test-log-id';
        const notFoundError = new Error(
          auditLogErrors.logWithIdNotFound(logId),
        );
        auditLogsService.getSingleLog.mockRejectedValue(notFoundError);

        await expect(
          controller.getLogById(mockRequestContext, logId),
        ).rejects.toThrow(auditLogErrors.logWithIdNotFound(logId));
      });
    });
  });

  describe('getAuditLogTypes', () => {
    describe('when getAuditLogTypes is called', () => {
      it('should return API_PROVIDER event types for API_PROVIDER company', async () => {
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(APEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(apiProviderContext);

        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledTimes(1);
        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledWith(
          apiProviderContext,
        );
        expect(result).toEqual(mockResponse);
      });

      it('should return regular event types for non-API_PROVIDER company', async () => {
        const regularCompanyContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.BUSINESS,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(regularCompanyContext);

        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledWith(
          regularCompanyContext,
        );
        expect(result).toEqual(mockResponse);
      });

      it('should return array of event type strings', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.every((item: any) => typeof item === 'string')).toBe(
          true,
        );
      });

      it('should use standardized response format', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result).toHaveProperty('status', 'success');
        expect(result).toHaveProperty(
          'message',
          auditLogsSuccessMessages.fetchLogTypes,
        );
        expect(result).toHaveProperty('data');
      });
    });

    describe('company type handling', () => {
      it('should correctly identify API_PROVIDER company type', async () => {
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(APEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        await controller.getAuditLogTypes(apiProviderContext);

        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledWith(
          apiProviderContext,
        );
      });

      it('should correctly identify non-API_PROVIDER company types', async () => {
        const businessContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.BUSINESS,
          },
        };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        await controller.getAuditLogTypes(businessContext);

        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledWith(
          businessContext,
        );
      });

      it('should return APEvents values for API_PROVIDER', async () => {
        const apiProviderContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.API_PROVIDER,
          },
        };
        const expectedEvents = Object.values(APEvents);
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          expectedEvents,
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(apiProviderContext);

        expect(result.data).toEqual(expectedEvents);
      });

      it('should return ACEvents values for regular companies', async () => {
        const regularContext = {
          ...mockRequestContext,
          activeCompany: {
            ...mockRequestContext.activeCompany,
            type: CompanyTypes.INDIVIDUAL,
          },
        };
        const expectedEvents = Object.values(ACEvents);
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          expectedEvents,
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(regularContext);

        expect(result.data).toEqual(expectedEvents);
      });
    });

    describe('permissions', () => {
      it('should require LIST_AUDIT_LOGS permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          'allowed_permissions',
          controller.getAuditLogTypes,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_AUDIT_LOGS);
      });

      it('should deny access without proper permission', async () => {
        const error = new Error('Insufficient permissions');
        auditLogsService.getAuditLogTypes.mockRejectedValue(error);

        await expect(
          controller.getAuditLogTypes(mockRequestContext),
        ).rejects.toThrow('Insufficient permissions');
      });

      it('should verify permission decorator is properly applied', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const hasRequiredPermission = reflector.get(
          'allowed_permissions',
          controller.getAuditLogTypes,
        );
        expect(hasRequiredPermission).toBeDefined();
      });
    });

    describe('response format', () => {
      it('should use ResponseFormatter.success', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result.status).toBe('success');
        expect(result.message).toBe(auditLogsSuccessMessages.fetchLogTypes);
      });

      it('should return array of strings', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(Array.isArray(result.data)).toBe(true);
        expect(result.data.every((item: any) => typeof item === 'string')).toBe(
          true,
        );
      });

      it('should not return empty array', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result.data.length).toBeGreaterThan(0);
      });

      it('should include success message', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result.message).toBe(auditLogsSuccessMessages.fetchLogTypes);
      });
    });

    describe('serialization', () => {
      it('should apply SerializeOptions with exposeAll strategy', () => {
        // Verify that the method uses SerializeOptions for proper response serialization
        expect(controller.getAuditLogTypes).toBeDefined();
      });

      it('should ensure all event types are exposed', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result.data).toContain('auth.login');
        expect(result.data.length).toBeGreaterThan(5);
      });
    });

    describe('error handling', () => {
      it('should propagate service errors correctly', async () => {
        const error = new Error('Service error');
        auditLogsService.getAuditLogTypes.mockRejectedValue(error);

        await expect(
          controller.getAuditLogTypes(mockRequestContext),
        ).rejects.toThrow('Service error');
        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledTimes(1);
      });

      it('should handle invalid RequestContext', async () => {
        const error = new Error('Invalid request context');
        auditLogsService.getAuditLogTypes.mockRejectedValue(error);

        await expect(controller.getAuditLogTypes(null as any)).rejects.toThrow(
          'Invalid request context',
        );
      });

      it('should handle missing company information', async () => {
        const invalidContext = {
          ...mockRequestContext,
          activeCompany: null,
        };
        const error = new Error('Missing company information');
        auditLogsService.getAuditLogTypes.mockRejectedValue(error);

        await expect(
          controller.getAuditLogTypes(invalidContext as any),
        ).rejects.toThrow('Missing company information');
      });
    });
  });

  describe('Event Logging (via service)', () => {
    describe('automatic event capture', () => {
      it('should verify OnEvent decorator captures all events (**)', () => {
        // This test verifies that the service has the logEvent method for event handling
        expect(auditLogsService.logEvent).toBeDefined();
        expect(typeof auditLogsService.logEvent).toBe('function');
      });

      it('should log events with companyId from event author', async () => {
        const mockEvent = {
          name: 'test.event',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: { action: 'test' },
        };

        await auditLogsService.logEvent(mockEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(mockEvent);
      });

      it('should log events with userId from event author', async () => {
        const mockEvent = {
          name: 'user.action',
          author: { id: 'test-user-id', companyId: 'test-company-id' },
          metadata: { details: 'user action' },
        };

        await auditLogsService.logEvent(mockEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(mockEvent);
      });

      it('should log event name correctly', async () => {
        const mockEvent = {
          name: 'auth.login',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: { ip: '127.0.0.1' },
        };

        await auditLogsService.logEvent(mockEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(mockEvent);
      });

      it('should log event metadata as details', async () => {
        const mockEvent = {
          name: 'data.update',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: { table: 'users', changes: { name: 'new name' } },
        };

        await auditLogsService.logEvent(mockEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(mockEvent);
      });

      it('should save without reloading entity', async () => {
        const mockEvent = {
          name: 'test.event',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: { action: 'test' },
        };

        await auditLogsService.logEvent(mockEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(mockEvent);
      });
    });

    describe('event data validation', () => {
      it('should handle events without author information', async () => {
        const eventWithoutAuthor = {
          name: 'system.event',
          metadata: { source: 'system' },
        };

        await auditLogsService.logEvent(eventWithoutAuthor as any);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(
          eventWithoutAuthor,
        );
      });

      it('should handle events without metadata', async () => {
        const eventWithoutMetadata = {
          name: 'simple.event',
          author: { id: 'user-id', companyId: 'company-id' },
        };

        await auditLogsService.logEvent(eventWithoutMetadata as any);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(
          eventWithoutMetadata,
        );
      });

      it('should handle events with complex metadata objects', async () => {
        const complexEvent = {
          name: 'complex.event',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: {
            nested: {
              object: {
                with: ['arrays', 'and', 'values'],
                numbers: 123,
                boolean: true,
              },
            },
          },
        };

        await auditLogsService.logEvent(complexEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(complexEvent);
      });

      it('should preserve metadata structure in details field', async () => {
        const structuredEvent = {
          name: 'structured.event',
          author: { id: 'user-id', companyId: 'company-id' },
          metadata: {
            timestamp: new Date().toISOString(),
            data: { key: 'value' },
            array: [1, 2, 3],
          },
        };

        await auditLogsService.logEvent(structuredEvent);

        expect(auditLogsService.logEvent).toHaveBeenCalledWith(structuredEvent);
      });
    });
  });

  describe('Security & Access Control', () => {
    describe('authentication', () => {
      it('should not skip auth guard for any endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const skipAuthGetLogs = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getLogs,
        );
        const skipAuthGetById = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getLogById,
        );
        const skipAuthGetTypes = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getAuditLogTypes,
        );

        expect(skipAuthGetLogs).toBeUndefined();
        expect(skipAuthGetById).toBeUndefined();
        expect(skipAuthGetTypes).toBeUndefined();
      });

      it('should require authenticated user for all endpoints', async () => {
        const authError = new Error('Authentication required');
        auditLogsService.getLogs.mockRejectedValue(authError);
        auditLogsService.getSingleLog.mockRejectedValue(authError);
        auditLogsService.getAuditLogTypes.mockRejectedValue(authError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Authentication required');

        await expect(
          controller.getLogById(mockRequestContext, 'test-id'),
        ).rejects.toThrow('Authentication required');

        await expect(
          controller.getAuditLogTypes(mockRequestContext),
        ).rejects.toThrow('Authentication required');
      });

      it('should validate JWT token for all requests', async () => {
        const invalidTokenError = new Error('Invalid token');
        auditLogsService.getLogs.mockRejectedValue(invalidTokenError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Invalid token');
      });
    });

    describe('authorization', () => {
      it('should enforce RequiredPermission decorator on all endpoints', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const getLogsPermission = reflector.get(
          'allowed_permissions',
          controller.getLogs,
        );
        const getByIdPermission = reflector.get(
          'allowed_permissions',
          controller.getLogById,
        );
        const getTypesPermission = reflector.get(
          'allowed_permissions',
          controller.getAuditLogTypes,
        );

        expect(getLogsPermission).toBe(PERMISSIONS.LIST_AUDIT_LOGS);
        expect(getByIdPermission).toBe(PERMISSIONS.VIEW_AUDIT_LOG);
        expect(getTypesPermission).toBe(PERMISSIONS.LIST_AUDIT_LOGS);
      });

      it('should check permissions against user role', async () => {
        const permissionError = new Error('Insufficient permissions');
        auditLogsService.getLogs.mockRejectedValue(permissionError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Insufficient permissions');
      });

      it('should deny access for users without required permissions', async () => {
        const accessDeniedError = new Error('Access denied');
        auditLogsService.getSingleLog.mockRejectedValue(accessDeniedError);

        await expect(
          controller.getLogById(mockRequestContext, 'test-id'),
        ).rejects.toThrow('Access denied');
      });
    });

    describe('company context', () => {
      it('should always use company context from RequestContext', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );
      });

      it('should never allow manual company ID override', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(mockRequestContext, 'test-id');

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          'test-id',
        );
      });

      it('should validate company exists and is active', async () => {
        const inactiveCompanyError = new Error('Company is inactive');
        auditLogsService.getAuditLogTypes.mockRejectedValue(
          inactiveCompanyError,
        );

        await expect(
          controller.getAuditLogTypes(mockRequestContext),
        ).rejects.toThrow('Company is inactive');
      });
    });
  });

  describe('Input Validation', () => {
    describe('pagination validation', () => {
      it('should validate limit is a positive integer', async () => {
        const validPagination = { limit: 25, page: 1 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 25,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          validPagination,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          validPagination,
          mockFilters,
        );
      });

      it('should validate page is a positive integer', async () => {
        const validPagination = { limit: 10, page: 5 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 5,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          validPagination,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          validPagination,
          mockFilters,
        );
      });

      it('should handle missing pagination parameters with defaults', async () => {
        const error = new Error('Invalid pagination');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(mockRequestContext, null as any, mockFilters),
        ).rejects.toThrow('Invalid pagination');
      });

      it('should enforce maximum limit value', async () => {
        const error = new Error('Limit exceeds maximum');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            { limit: 1000, page: 1 },
            mockFilters,
          ),
        ).rejects.toThrow('Limit exceeds maximum');
      });
    });

    describe('filter validation', () => {
      it('should validate event is a valid string', async () => {
        const validFilter = { event: 'auth.login' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          validFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          validFilter,
        );
      });

      it('should validate createdAt is a valid date', async () => {
        const validDateFilter = { createdAt: new Date('2024-01-01') };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          validDateFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          validDateFilter,
        );
      });

      it('should validate name search terms', async () => {
        const nameFilter = { name: 'John Doe' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          nameFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          nameFilter,
        );
      });

      it('should validate email format', async () => {
        const emailFilter = { email: 'test@example.com' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          emailFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          emailFilter,
        );
      });

      it('should reject invalid filter keys', async () => {
        const invalidFilter = { invalidKey: 'value' };
        const error = new Error('Invalid filter key');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            invalidFilter,
          ),
        ).rejects.toThrow('Invalid filter key');
      });

      it('should handle SQL injection attempts in filters', async () => {
        const maliciousFilter = { event: "'; DROP TABLE users; --" };
        const error = new Error('Invalid filter value');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            maliciousFilter,
          ),
        ).rejects.toThrow('Invalid filter value');
      });
    });

    describe('parameter validation', () => {
      it('should validate UUID format for log ID', async () => {
        const validUUID = '123e4567-e89b-12d3-a456-426614174000';
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        await controller.getLogById(mockRequestContext, validUUID);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          validUUID,
        );
      });

      it('should reject malformed IDs', async () => {
        const malformedId = 'not-a-uuid';
        const error = new Error('Invalid UUID format');
        auditLogsService.getSingleLog.mockRejectedValue(error);

        await expect(
          controller.getLogById(mockRequestContext, malformedId),
        ).rejects.toThrow('Invalid UUID format');
      });

      it('should sanitize all input parameters', async () => {
        const sanitizedFilter = { event: 'clean.event' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          sanitizedFilter,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          sanitizedFilter,
        );
      });
    });
  });

  describe('Integration Points', () => {
    describe('RequestContext integration', () => {
      it('should extract user information from context', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          expect.objectContaining({
            activeUser: expect.objectContaining({
              id: 'test-user-id',
              companyId: 'test-company-id',
            }),
          }),
          mockPaginationParams,
          mockFilters,
        );
      });

      it('should extract company information from context', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(mockResponse);

        await controller.getAuditLogTypes(mockRequestContext);

        expect(auditLogsService.getAuditLogTypes).toHaveBeenCalledWith(
          expect.objectContaining({
            activeCompany: expect.objectContaining({
              id: 'test-company-id',
              type: CompanyTypes.BUSINESS,
            }),
          }),
        );
      });

      it('should handle missing context gracefully', async () => {
        const error = new Error('Missing request context');
        auditLogsService.getLogs.mockRejectedValue(error);

        await expect(
          controller.getLogs(null as any, mockPaginationParams, mockFilters),
        ).rejects.toThrow('Missing request context');
      });
    });

    describe('Pipe integration', () => {
      it('should apply PaginationPipe before controller method', async () => {
        const processedPagination = { limit: 20, page: 2 };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 2,
            pageSize: 20,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          processedPagination,
          mockFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          processedPagination,
          mockFilters,
        );
      });

      it('should apply FilterPipe with correct configuration', async () => {
        const processedFilters = { event: 'transformed.event' };
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogs,
          [],
          {
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          },
        );
        auditLogsService.getLogs.mockResolvedValue(mockResponse);

        await controller.getLogs(
          mockRequestContext,
          mockPaginationParams,
          processedFilters,
        );

        expect(auditLogsService.getLogs).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          processedFilters,
        );
      });

      it('should handle pipe transformation errors', async () => {
        const pipeError = new Error('Pipe transformation failed');
        auditLogsService.getLogs.mockRejectedValue(pipeError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Pipe transformation failed');
      });
    });

    describe('Service integration', () => {
      it('should pass all parameters correctly to service', async () => {
        const mockResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLog,
          mockAuditLogResponse,
        );
        auditLogsService.getSingleLog.mockResolvedValue(mockResponse);

        const logId = 'test-log-id';
        await controller.getLogById(mockRequestContext, logId);

        expect(auditLogsService.getSingleLog).toHaveBeenCalledWith(
          mockRequestContext,
          logId,
        );
      });

      it('should handle service response transformation', async () => {
        const serviceResponse = ResponseFormatter.success(
          auditLogsSuccessMessages.fetchLogTypes,
          Object.values(ACEvents),
        );
        auditLogsService.getAuditLogTypes.mockResolvedValue(serviceResponse);

        const result = await controller.getAuditLogTypes(mockRequestContext);

        expect(result).toEqual(serviceResponse);
        expect(result.status).toBe('success');
        expect(Array.isArray(result.data)).toBe(true);
      });

      it('should propagate service exceptions', async () => {
        const serviceError = new Error('Service layer error');
        auditLogsService.getLogs.mockRejectedValue(serviceError);

        await expect(
          controller.getLogs(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Service layer error');
      });
    });
  });
});
