import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from './auditLogs.service';
import {
  AuditLog,
  Company,
  Profile,
  User,
  Role,
} from '@common/database/entities';
import {
  AuditLogBuilder,
  UserBuilder,
  RoleBuilder,
  ProfileBuilder,
  CompanyBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import { auditLogsSuccessMessages } from './auditLogs.constants';
import { CompanyTypes } from '@common/database/constants';
import { UserStatuses } from '@common/database/entities/user.entity';
import { CompanyStatuses } from '@common/database/entities/company.entity';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { INotFoundException } from '@common/utils/exceptions/exceptions';
import { auditLogErrors } from '@auditLogs/auditLogs.errors';
import { BaseEvent } from '@shared/events/base.event';
import { APEvents, ACEvents } from '@shared/events/all.event';
import { GetAuditLogResponseDTO } from './dto/index.dto';
import { Equal } from 'typeorm';

describe('AuditLogsService', () => {
  let service: AuditLogsService;
  let auditLogRepository: MockRepository<AuditLog>;

  // Test data builders
  let mockUser: User;
  let mockApiProviderUser: User;
  let mockCompany: Company;
  let mockApiProviderCompany: Company;
  let mockRole: Role;
  let mockProfile: Profile;
  let mockAuditLog: AuditLog;
  let mockRequestContext: RequestContext;
  let mockApiProviderRequestContext: RequestContext;

  beforeEach(async () => {
    // Initialize repositories
    auditLogRepository = createMockRepository<AuditLog>();

    // Build test entities
    mockRole = new RoleBuilder()
      .with('id', 'role-id')
      .with('slug', 'admin')
      .build();

    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.BUSINESS)
      .build();

    mockApiProviderCompany = new CompanyBuilder()
      .with('id', 'api-provider-company-id')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.API_PROVIDER)
      .build();

    mockProfile = new ProfileBuilder()
      .with('firstName', 'John')
      .with('lastName', 'Doe')
      .with('phone', '+2348012345678')
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('emailVerified', true)
      .with('roleId', mockRole.id!)
      .with('companyId', mockCompany.id!)
      .with('company', mockCompany)
      .with('profile', mockProfile)
      .with('role', mockRole)
      .build();

    mockApiProviderUser = new UserBuilder()
      .with('id', 'api-provider-user-id')
      .with('email', 'apiprovider@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('emailVerified', true)
      .with('roleId', mockRole.id!)
      .with('companyId', mockApiProviderCompany.id!)
      .with('company', mockApiProviderCompany)
      .with('profile', mockProfile)
      .with('role', mockRole)
      .build();

    mockAuditLog = new AuditLogBuilder()
      .with('id', 'audit-log-id')
      .with('event', 'auth.login')
      .with('companyId', mockCompany.id!)
      .with('userId', mockUser.id!)
      .with('details', { ip: '127.0.0.1', userAgent: 'test-agent' })
      .with('user', mockUser)
      .with('createdAt', new Date())
      .with('updatedAt', new Date())
      .build();

    // Create request contexts
    mockRequestContext = new RequestContext({ user: mockUser });
    mockApiProviderRequestContext = new RequestContext({
      user: mockApiProviderUser,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        { provide: 'AuditLogRepository', useValue: auditLogRepository },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should successfully save audit log with complete event data', async () => {
      const mockEvent = new BaseEvent('auth.login', mockUser, {
        ip: '127.0.0.1',
        userAgent: 'test-agent',
      });

      auditLogRepository.save.mockResolvedValue(mockAuditLog);

      await service.logEvent(mockEvent);

      expect(auditLogRepository.save).toHaveBeenCalledWith(
        {
          companyId: mockUser.companyId,
          userId: mockUser.id,
          details: mockEvent.metadata,
          event: mockEvent.name,
        },
        { reload: false },
      );
    });

    it('should handle event with null author', async () => {
      const mockEvent = new BaseEvent('system.event', null, {
        automated: true,
      });

      auditLogRepository.save.mockResolvedValue(mockAuditLog);

      await service.logEvent(mockEvent);

      expect(auditLogRepository.save).toHaveBeenCalledWith(
        {
          companyId: undefined,
          userId: undefined,
          details: mockEvent.metadata,
          event: mockEvent.name,
        },
        { reload: false },
      );
    });

    it('should handle event with undefined metadata', async () => {
      const mockEvent = new BaseEvent('auth.logout', mockUser);

      auditLogRepository.save.mockResolvedValue(mockAuditLog);

      await service.logEvent(mockEvent);

      expect(auditLogRepository.save).toHaveBeenCalledWith(
        {
          companyId: mockUser.companyId,
          userId: mockUser.id,
          details: undefined,
          event: mockEvent.name,
        },
        { reload: false },
      );
    });
  });

  describe('getLogs', () => {
    const mockPaginationParams = { limit: 10, page: 1 };
    const mockFilters = { event: 'auth.login' };

    describe('input validation', () => {
      it('should handle invalid pagination parameters', async () => {
        const invalidPaginationParams = { limit: -1, page: 0 };
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, invalidPaginationParams);

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { companyId: mockUser.companyId },
          skip: 1, // Math.max(0, (0 - 1) * -1) = 1
          take: -1,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });
      });

      it('should handle null filters', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, mockPaginationParams, null);

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            companyId: mockUser.companyId,
          },
        });
      });
    });

    describe('filtering capabilities', () => {
      it('should filter by event type', async () => {
        const eventFilter = { event: 'auth.login' };
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, mockPaginationParams, eventFilter);

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            ...eventFilter,
            companyId: mockUser.companyId,
          },
        });

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { ...eventFilter, companyId: mockUser.companyId },
          skip: 0,
          take: 10,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });
      });

      it('should filter by createdAt date range', async () => {
        const dateFilter = { 
          createdAt: {
            gte: new Date('2023-01-01'),
            lte: new Date('2023-12-31')
          }
        };
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, mockPaginationParams, dateFilter);

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            ...dateFilter,
            companyId: mockUser.companyId,
          },
        });
      });

      it('should filter by multiple criteria', async () => {
        const multipleFilters = { 
          event: 'auth.login',
          userId: 'user-123',
          companyId: 'company-456'
        };
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, mockPaginationParams, multipleFilters);

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            ...multipleFilters,
            companyId: mockUser.companyId, // Should override the filter companyId
          },
        });
      });
    });

    describe('response format validation', () => {
      it('should return standardized response format with correct metadata', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        const result = await service.getLogs(mockRequestContext, mockPaginationParams);

        expect(result).toEqual(expect.objectContaining({
          status: 'success',
          message: auditLogsSuccessMessages.fetchLogs,
          data: expect.any(Array),
          meta: expect.objectContaining({
            totalNumberOfRecords: expect.any(Number),
            totalNumberOfPages: expect.any(Number),
            pageNumber: expect.any(Number),
            pageSize: expect.any(Number),
          }),
        }));
      });

      it('should return data in GetAuditLogResponseDTO format', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        const result = await service.getLogs(mockRequestContext, mockPaginationParams);

        expect(result.data).toEqual(expect.arrayContaining([
          expect.any(GetAuditLogResponseDTO)
        ]));
        expect(result.data).toHaveLength(1);
      });
    });

    describe('when user is from API_PROVIDER company', () => {
      it('should fetch all logs without company filter', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        const result = await service.getLogs(
          mockApiProviderRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            ...mockFilters,
          },
        });

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { ...mockFilters },
          skip: 0,
          take: 10,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogs,
            mockLogs.map((log) => new GetAuditLogResponseDTO(log)),
            expect.objectContaining({
              totalNumberOfRecords: 1,
              totalNumberOfPages: 1,
              pageNumber: 1,
              pageSize: 10,
            }),
          ),
        );
      });
    });

    describe('when user is from regular company', () => {
      it('should fetch logs filtered by user company', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        const result = await service.getLogs(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            ...mockFilters,
            companyId: mockUser.companyId,
          },
        });

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { ...mockFilters, companyId: mockUser.companyId },
          skip: 0,
          take: 10,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogs,
            mockLogs.map((log) => new GetAuditLogResponseDTO(log)),
            expect.objectContaining({
              totalNumberOfRecords: 1,
              totalNumberOfPages: 1,
              pageNumber: 1,
              pageSize: 10,
            }),
          ),
        );
      });

      it('should handle pagination correctly', async () => {
        const paginationParams = { limit: 5, page: 3 };
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(25);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        const result = await service.getLogs(
          mockRequestContext,
          paginationParams,
        );

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { companyId: mockUser.companyId },
          skip: 10, // (3 - 1) * 5
          take: 5,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });

        expect(result.meta).toEqual(
          expect.objectContaining({
            totalNumberOfRecords: 25,
            totalNumberOfPages: 5, // Math.ceil(25 / 5)
            pageNumber: 3,
            pageSize: 5,
          }),
        );
      });

      it('should work without filters', async () => {
        const mockLogs = [mockAuditLog];
        auditLogRepository.count.mockResolvedValue(1);
        auditLogRepository.find.mockResolvedValue(mockLogs);

        await service.getLogs(mockRequestContext, mockPaginationParams);

        expect(auditLogRepository.count).toHaveBeenCalledWith({
          where: {
            companyId: mockUser.companyId,
          },
        });

        expect(auditLogRepository.find).toHaveBeenCalledWith({
          where: { companyId: mockUser.companyId },
          skip: 0,
          take: 10,
          order: {
            createdAt: 'DESC',
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });
      });
    });
  });

  describe('getSingleLog', () => {
    const logId = 'audit-log-id';

    describe('input validation', () => {
      it('should handle empty string ID', async () => {
        auditLogRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getSingleLog(mockRequestContext, ''),
        ).rejects.toThrow(INotFoundException);

        expect(auditLogRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: Equal(''),
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });
      });

      it('should handle null/undefined ID', async () => {
        auditLogRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getSingleLog(mockRequestContext, null as any),
        ).rejects.toThrow(INotFoundException);
      });
    });

    describe('company access control', () => {
      it('should successfully return log for same company', async () => {
        auditLogRepository.findOne.mockResolvedValue(mockAuditLog);

        const result = await service.getSingleLog(mockRequestContext, logId);

        expect(auditLogRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: Equal(logId),
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLog,
            new GetAuditLogResponseDTO(mockAuditLog),
          ),
        );
      });

      it('should allow API_PROVIDER to access any log', async () => {
        const differentCompanyLog = new AuditLogBuilder()
          .with('id', 'different-company-log-id')
          .with('companyId', 'different-company-id')
          .with('userId', 'different-user-id')
          .build();

        auditLogRepository.findOne.mockResolvedValue(differentCompanyLog);

        const result = await service.getSingleLog(mockApiProviderRequestContext, logId);

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLog,
            new GetAuditLogResponseDTO(differentCompanyLog),
          ),
        );
      });

      it('should return log even if it belongs to different company (no explicit filtering)', async () => {
        // Note: The current implementation doesn't filter by company in getSingleLog
        // This test documents the current behavior
        const differentCompanyLog = new AuditLogBuilder()
          .with('id', logId)
          .with('companyId', 'different-company-id')
          .build();

        auditLogRepository.findOne.mockResolvedValue(differentCompanyLog);

        const result = await service.getSingleLog(mockRequestContext, logId);

        expect(result.data).toEqual(new GetAuditLogResponseDTO(differentCompanyLog));
      });
    });

    describe('error handling', () => {
      it('should throw INotFoundException when log not found', async () => {
        auditLogRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getSingleLog(mockRequestContext, logId),
        ).rejects.toThrow(INotFoundException);

        await expect(
          service.getSingleLog(mockRequestContext, logId),
        ).rejects.toThrow(auditLogErrors.logWithIdNotFound(logId));
      });

      it('should throw specific error message with log ID', async () => {
        const specificLogId = 'specific-missing-log-id';
        auditLogRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getSingleLog(mockRequestContext, specificLogId),
        ).rejects.toThrow(auditLogErrors.logWithIdNotFound(specificLogId));
      });
    });

    describe('response format', () => {
      it('should return standardized response format', async () => {
        auditLogRepository.findOne.mockResolvedValue(mockAuditLog);

        const result = await service.getSingleLog(mockRequestContext, logId);

        expect(result).toEqual(expect.objectContaining({
          status: 'success',
          message: auditLogsSuccessMessages.fetchLog,
          data: expect.any(GetAuditLogResponseDTO),
        }));
      });

      it('should include all required log details', async () => {
        const detailedLog = new AuditLogBuilder()
          .with('id', logId)
          .with('event', 'auth.login')
          .with('details', { ip: '192.168.1.1', userAgent: 'Chrome' })
          .with('user', mockUser)
          .with('createdAt', new Date())
          .with('updatedAt', new Date())
          .build();

        auditLogRepository.findOne.mockResolvedValue(detailedLog);

        const result = await service.getSingleLog(mockRequestContext, logId);

        expect(result.data).toEqual(expect.objectContaining({
          id: logId,
          event: 'auth.login',
          details: expect.any(Object),
          user: expect.any(Object),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }));
      });

      it('should work with different log IDs', async () => {
        const differentLogId = 'different-log-id';
        const differentMockLog = { ...mockAuditLog, id: differentLogId };
        auditLogRepository.findOne.mockResolvedValue(differentMockLog);

        const result = await service.getSingleLog(
          mockRequestContext,
          differentLogId,
        );

        expect(auditLogRepository.findOne).toHaveBeenCalledWith({
          where: {
            id: Equal(differentLogId),
          },
          relations: {
            user: {
              profile: true,
            },
          },
        });

        expect(result.data).toEqual(new GetAuditLogResponseDTO(differentMockLog));
      });
    });
  });

  describe('getAuditLogTypes', () => {
    describe('company type-based event filtering', () => {
      it('should return APEvents for API_PROVIDER company', async () => {
        const result = await service.getAuditLogTypes(
          mockApiProviderRequestContext,
        );

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogTypes,
            Object.values(APEvents),
          ),
        );
      });

      it('should return ACEvents for BUSINESS company', async () => {
        const result = await service.getAuditLogTypes(mockRequestContext);

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogTypes,
            Object.values(ACEvents),
          ),
        );
      });

      it('should return ACEvents for LICENSED_ENTITY company', async () => {
        const licensedEntityCompany = new CompanyBuilder()
          .with('id', 'licensed-entity-id')
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .build();

        const licensedEntityUser = new UserBuilder()
          .with('id', 'licensed-entity-user-id')
          .with('companyId', licensedEntityCompany.id!)
          .with('company', licensedEntityCompany)
          .build();

        const licensedEntityContext = new RequestContext({
          user: licensedEntityUser,
        });

        const result = await service.getAuditLogTypes(licensedEntityContext);

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogTypes,
            Object.values(ACEvents),
          ),
        );
      });

      it('should return ACEvents for INDIVIDUAL company', async () => {
        const individualCompany = new CompanyBuilder()
          .with('id', 'individual-company-id')
          .with('type', CompanyTypes.INDIVIDUAL)
          .build();

        const individualUser = new UserBuilder()
          .with('id', 'individual-user-id')
          .with('companyId', individualCompany.id!)
          .with('company', individualCompany)
          .build();

        const individualContext = new RequestContext({
          user: individualUser,
        });

        const result = await service.getAuditLogTypes(individualContext);

        expect(result).toEqual(
          ResponseFormatter.success(
            auditLogsSuccessMessages.fetchLogTypes,
            Object.values(ACEvents),
          ),
        );
      });
    });

    describe('response format validation', () => {
      it('should return standardized response format', async () => {
        const result = await service.getAuditLogTypes(mockRequestContext);

        expect(result).toEqual(expect.objectContaining({
          status: 'success',
          message: auditLogsSuccessMessages.fetchLogTypes,
          data: expect.any(Array),
        }));
      });

      it('should return array of string event types', async () => {
        const result = await service.getAuditLogTypes(mockRequestContext);

        expect(result.data).toEqual(expect.arrayContaining([
          expect.any(String)
        ]));
        expect(result.data!.length).toBeGreaterThan(0);
      });

      it('should return different event sets for different company types', async () => {
        const apiProviderResult = await service.getAuditLogTypes(mockApiProviderRequestContext);
        const businessResult = await service.getAuditLogTypes(mockRequestContext);

        expect(apiProviderResult.data).not.toEqual(businessResult.data);
        expect(apiProviderResult.data!.length).toBeGreaterThan(businessResult.data!.length);
      });
    });

    describe('event type content validation', () => {
      it('should include common events in ACEvents', async () => {
        const result = await service.getAuditLogTypes(mockRequestContext);
        const eventTypes = result.data;

        expect(eventTypes).toContain(ACEvents.LOGIN);
        expect(eventTypes).toContain(ACEvents.SIGN_UP);
        expect(eventTypes).toContain(ACEvents.UPDATE_PROFILE);
      });

      it('should include provider-specific events in APEvents', async () => {
        const result = await service.getAuditLogTypes(mockApiProviderRequestContext);
        const eventTypes = result.data;

        expect(eventTypes).toContain(APEvents.CREATE_APIS);
        expect(eventTypes).toContain(APEvents.DELETE_APIS);
        expect(eventTypes).toContain(APEvents.UPDATE_APIS);
        expect(eventTypes).toContain(APEvents.LOGIN);
        expect(eventTypes).toContain(APEvents.SIGN_UP);
      });

      it('should not include provider-specific events in ACEvents', async () => {
        const result = await service.getAuditLogTypes(mockRequestContext);
        const eventTypes = result.data;

        expect(eventTypes).not.toContain(APEvents.CREATE_APIS);
        expect(eventTypes).not.toContain(APEvents.DELETE_APIS);
        expect(eventTypes).not.toContain(APEvents.UPDATE_APIS);
      });
    });
  });

  describe('logEvent requirements validation', () => {
    describe('domain event logging', () => {
      it('should save log entry without reloading entity', async () => {
        const mockEvent = new BaseEvent('auth.login', mockUser, { ip: '127.0.0.1' });
        auditLogRepository.save.mockResolvedValue(mockAuditLog);

        await service.logEvent(mockEvent);

        expect(auditLogRepository.save).toHaveBeenCalledWith(
          expect.any(Object),
          { reload: false }
        );
      });

      it('should include all required fields in log entry', async () => {
        const eventMetadata = { ip: '192.168.1.1', userAgent: 'Chrome', sessionId: 'session123' };
        const mockEvent = new BaseEvent('auth.login', mockUser, eventMetadata);
        auditLogRepository.save.mockResolvedValue(mockAuditLog);

        await service.logEvent(mockEvent);

        expect(auditLogRepository.save).toHaveBeenCalledWith({
          companyId: mockUser.companyId,
          userId: mockUser.id,
          event: 'auth.login',
          details: eventMetadata,
        }, { reload: false });
      });

      it('should handle events from different companies', async () => {
        const otherCompanyUser = new UserBuilder()
          .with('id', 'other-user-id')
          .with('companyId', 'other-company-id')
          .build();
        
        const mockEvent = new BaseEvent('user.created', otherCompanyUser, { source: 'admin' });
        auditLogRepository.save.mockResolvedValue(mockAuditLog);

        await service.logEvent(mockEvent);

        expect(auditLogRepository.save).toHaveBeenCalledWith({
          companyId: 'other-company-id',
          userId: 'other-user-id',
          event: 'user.created',
          details: { source: 'admin' },
        }, { reload: false });
      });
    });
  });
});
