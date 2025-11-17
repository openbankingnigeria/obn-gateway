import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PERMISSIONS } from '@permissions/types';
import { ImportApiSpecEvent } from '@shared/events/api.event';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { createMockContext } from '@test/utils/mocks/http.mock';
import { APIController } from './apis.controller';
import { APIService } from './apis.service';
import { ApiSpecImportService } from './import/import.service';

describe('APIController', () => {
  let controller: APIController;
  let service: jest.Mocked<APIService>;
  let importService: jest.Mocked<ApiSpecImportService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let reflector: Reflector;
  let module: TestingModule;

  const mockService = {
    viewAPIs: jest.fn(),
    createAPI: jest.fn(),
    viewAPI: jest.fn(),
    updateAPI: jest.fn(),
    deleteAPI: jest.fn(),
    updateCompanyApiAccess: jest.fn(),
    getApisAssignedToCompany: jest.fn(),
    getAPILogs: jest.fn(),
    getAPILogsStats: jest.fn(),
    getAPILogsStatsAggregate: jest.fn(),
    getAPILog: jest.fn(),
    getTransformation: jest.fn(),
    setTransformation: jest.fn(),
    getActualImportSuccessCount: jest.fn(),
  };

  const mockImportService = {
    parseAndValidateSpec: jest.fn(),
    createImportRecord: jest.fn(),
    finalizeImport: jest.fn(),
    transformEndpointToApiDto: jest.fn(),
    listImports: jest.fn(),
    getImport: jest.fn(),
    getImportForRetry: jest.fn(),
    updateImportAfterRetry: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
    on: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    once: jest.fn(),
    prependListener: jest.fn(),
    prependOnceListener: jest.fn(),
    eventNames: jest.fn(),
    getMaxListeners: jest.fn(),
    setMaxListeners: jest.fn(),
    listenerCount: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-value'),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [APIController],
      providers: [
        {
          provide: APIService,
          useValue: mockService,
        },
        {
          provide: ApiSpecImportService,
          useValue: mockImportService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<APIController>(APIController);
    service = module.get(APIService);
    importService = module.get(ApiSpecImportService);
    eventEmitter = module.get(EventEmitter2);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Controller Definition', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
  });

  describe('Permission Requirements', () => {
    it('should require LIST_API_ENDPOINTS permission for viewAPIs', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewAPIs);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_ENDPOINTS);
    });

    it('should require ADD_API_ENDPOINT permission for createAPI', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.createAPI);
      expect(permissions).toEqual(PERMISSIONS.ADD_API_ENDPOINT);
    });

    it('should require VIEW_API_ENDPOINT permission for viewAPI', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewAPI);
      expect(permissions).toEqual(PERMISSIONS.VIEW_API_ENDPOINT);
    });

    it('should require UPDATE_API_ENDPOINT permission for updateAPI', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.updateAPI);
      expect(permissions).toEqual(PERMISSIONS.UPDATE_API_ENDPOINT);
    });

    it('should require DELETE_API_ENDPOINT permission for deletAPI', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.deletAPI);
      expect(permissions).toEqual(PERMISSIONS.DELETE_API_ENDPOINT);
    });

    it('should require ASSIGN_API_ENDPOINTS permission for assignAPIs', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.assignAPIs);
      expect(permissions).toEqual(PERMISSIONS.ASSIGN_API_ENDPOINTS);
    });

    it('should require VIEW_ASSIGNED_API_ENDPOINTS permission for viewMyCompanyApis', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewMyCompanyApis);
      expect(permissions).toEqual(PERMISSIONS.VIEW_ASSIGNED_API_ENDPOINTS);
    });

    it('should require AP_VIEW_ASSIGNED_API_ENDPOINTS permission for viewCompanyApis', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewCompanyApis);
      expect(permissions).toEqual(PERMISSIONS.AP_VIEW_ASSIGNED_API_ENDPOINTS);
    });

    it('should require LIST_API_CALLS permission for getAPILogs', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getAPILogs);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_CALLS);
    });

    it('should require LIST_API_CALLS permission for getAPILogsStats', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getAPILogsStats);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_CALLS);
    });

    it('should require LIST_API_CALLS permission for getAPILogsStatsAggregate', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getAPILogsStatsAggregate);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_CALLS);
    });

    it('should require VIEW_API_CALL permission for getAPILog', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getAPILog);
      expect(permissions).toEqual(PERMISSIONS.VIEW_API_CALL);
    });

    it('should require VIEW_API_TRANSFORMATION permission for getTransformation', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getTransformation);
      expect(permissions).toEqual(PERMISSIONS.VIEW_API_TRANSFORMATION);
    });

    it('should require SET_API_TRANSFORMATION permission for setTransformation', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.setTransformation);
      expect(permissions).toEqual(PERMISSIONS.SET_API_TRANSFORMATION);
    });

    it('should require IMPORT_API_SPEC permission for importApiSpec', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.importApiSpec);
      expect(permissions).toEqual(PERMISSIONS.IMPORT_API_SPEC);
    });

    it('should require LIST_API_IMPORTS permission for listImports', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.listImports);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_IMPORTS);
    });

    it('should require VIEW_API_IMPORT permission for getImport', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.getImport);
      expect(permissions).toEqual(PERMISSIONS.VIEW_API_IMPORT);
    });

    it('should require RETRY_API_IMPORT permission for retryImport', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.retryImport);
      expect(permissions).toEqual(PERMISSIONS.RETRY_API_IMPORT);
    });
  });

  describe('viewAPIs', () => {
    it('should call apiService.viewAPIs with the correct parameters', async () => {
      const { ctx } = createMockContext();
      const params: { environment: KONG_ENVIRONMENT } = {
        environment: KONG_ENVIRONMENT.DEVELOPMENT,
      };
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const expectedResponse = ResponseFormatter.success(
        'APIs fetched successfully',
        []
      );

      service.viewAPIs.mockResolvedValue(expectedResponse);

      const result = await controller.viewAPIs(ctx, params, pagination, filters);

      expect(service.viewAPIs).toHaveBeenCalledWith(
        ctx,
        params.environment,
        pagination,
        filters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createAPI', () => {
    it('should call apiService.createAPI with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const createData = {
        collectionId: 'collection-123',
        name: 'Test API',
        enabled: true,
        upstream: { url: 'https://api.example.com' },
        downstream: { path: '/test', method: 'GET', url: '/external/test' },
        tiers: [1, 2],
        introspectAuthorization: false,
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API created successfully',
        expect.any(Object)
      );

      service.createAPI.mockResolvedValue(expectedResponse as any);

      const result = await controller.createAPI(ctx, params, createData);

      expect(service.createAPI).toHaveBeenCalledWith(ctx, params.environment, createData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewAPI', () => {
    it('should call apiService.viewAPI with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const apiId = 'api-123';
      const expectedResponse = ResponseFormatter.success(
        'API fetched successfully',
        expect.any(Object)
      );

      service.viewAPI.mockResolvedValue(expectedResponse as any);

      const result = await controller.viewAPI(ctx, params, apiId);

      expect(service.viewAPI).toHaveBeenCalledWith(ctx, params.environment, apiId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateAPI', () => {
    it('should call apiService.updateAPI with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const apiId = 'api-123';
      const updateData = {
        name: 'Updated API',
        enabled: false,
        introspectAuthorization: true,
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API updated successfully',
        expect.any(Object)
      );

      service.updateAPI.mockResolvedValue(expectedResponse as any);

      const result = await controller.updateAPI(ctx, params, apiId, updateData);

      expect(service.updateAPI).toHaveBeenCalledWith(ctx, params.environment, apiId, updateData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deletAPI', () => {
    it('should call apiService.deleteAPI with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const apiId = 'api-123';
      const expectedResponse = ResponseFormatter.success('API deleted successfully');

      service.deleteAPI.mockResolvedValue(expectedResponse);

      const result = await controller.deletAPI(ctx, params, apiId);

      expect(service.deleteAPI).toHaveBeenCalledWith(ctx, params.environment, apiId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('assignAPIs', () => {
    it('should call apiService.updateCompanyApiAccess with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const companyId = 'company-123';
      const assignData = {
        apiIds: ['api-1', 'api-2', 'api-3'],
      };
      const expectedResponse = ResponseFormatter.success('Company API access updated successfully');

      service.updateCompanyApiAccess.mockResolvedValue(expectedResponse);

      const result = await controller.assignAPIs(ctx, params, companyId, assignData);

      expect(service.updateCompanyApiAccess).toHaveBeenCalledWith(
        ctx,
        params.environment,
        companyId,
        assignData,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewMyCompanyApis', () => {
    it('should call apiService.getApisAssignedToCompany with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const expectedResponse = ResponseFormatter.success(
        'Assigned APIs fetched successfully',
        []
      );

      service.getApisAssignedToCompany.mockResolvedValue(expectedResponse);

      const result = await controller.viewMyCompanyApis(ctx, params, pagination, filters);

      expect(service.getApisAssignedToCompany).toHaveBeenCalledWith(
        ctx,
        params.environment,
        undefined,
        pagination,
        filters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewCompanyApis', () => {
    it('should call apiService.getApisAssignedToCompany with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const companyId = 'company-123';
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const expectedResponse = ResponseFormatter.success(
        'Company APIs fetched successfully',
        []
      );

      service.getApisAssignedToCompany.mockResolvedValue(expectedResponse);

      const result = await controller.viewCompanyApis(ctx, params, companyId, pagination, filters);

      expect(service.getApisAssignedToCompany).toHaveBeenCalledWith(
        ctx,
        params.environment,
        companyId,
        pagination,
        filters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAPILogs', () => {
    it('should call apiService.getAPILogs with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const pagination = { page: 1, limit: 10 };
      const filters = { 
        filter: 'test-filter',
        startDate: '2023-01-01', 
        endDate: '2023-12-31' 
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API logs fetched successfully',
        []
      );

      service.getAPILogs.mockResolvedValue(expectedResponse as any);

      const result = await controller.getAPILogs(ctx, params, pagination, filters);

      expect(service.getAPILogs).toHaveBeenCalledWith(
        ctx,
        params.environment,
        pagination,
        filters,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAPILogsStats', () => {
    it('should call apiService.getAPILogsStats with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const filters = { 
        filter: 'test-filter',
        period: 'daily' 
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API logs statistics fetched successfully',
        expect.any(Object)
      );

      service.getAPILogsStats.mockResolvedValue(expectedResponse as any);

      const result = await controller.getAPILogsStats(ctx, params, filters);

      expect(service.getAPILogsStats).toHaveBeenCalledWith(ctx, params.environment, filters);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAPILogsStatsAggregate', () => {
    it('should call apiService.getAPILogsStatsAggregate with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const filters = { 
        filter: 'test-filter',
        aggregationType: 'monthly' 
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API logs aggregate statistics fetched successfully',
        expect.any(Object)
      );

      service.getAPILogsStatsAggregate.mockResolvedValue(expectedResponse as any);

      const result = await controller.getAPILogsStatsAggregate(ctx, params, filters);

      expect(service.getAPILogsStatsAggregate).toHaveBeenCalledWith(ctx, params.environment, filters);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getAPILog', () => {
    it('should call apiService.getAPILog with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const logId = 'log-123';
      const expectedResponse = ResponseFormatter.success(
        'API log fetched successfully',
        expect.any(Object)
      );

      service.getAPILog.mockResolvedValue(expectedResponse as any);

      const result = await controller.getAPILog(ctx, params, logId);

      expect(service.getAPILog).toHaveBeenCalledWith(ctx, params.environment, logId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getTransformation', () => {
    it('should call apiService.getTransformation with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const apiId = 'api-123';
      const expectedResponse = ResponseFormatter.success(
        'API transformation fetched successfully',
        expect.any(Object)
      );

      service.getTransformation.mockResolvedValue(expectedResponse as any);

      const result = await controller.getTransformation(ctx, params, apiId);

      expect(service.getTransformation).toHaveBeenCalledWith(ctx, params.environment, apiId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('setTransformation', () => {
    it('should call apiService.setTransformation with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const apiId = 'api-123';
      const transformationData = {
        upstream: { enabled: true },
        downstream: { enabled: false },
      } as any;
      const expectedResponse = ResponseFormatter.success(
        'API transformation set successfully',
        expect.any(Object)
      );

      service.setTransformation.mockResolvedValue(expectedResponse as any);

      const result = await controller.setTransformation(ctx, params, apiId, transformationData);

      expect(service.setTransformation).toHaveBeenCalledWith(
        ctx,
        params.environment,
        apiId,
        transformationData,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('importApiSpec', () => {
  it('should import API spec successfully', async () => {
    const { ctx } = createMockContext();
    const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
    const mockFile = {
      buffer: Buffer.from('test spec content'),
      originalname: 'test.yaml',
    } as Express.Multer.File;
    const formData = {
      specName: 'Test Spec',
      collectionId: 'collection-123',
      enableByDefault: 'true',
      defaultTiers: JSON.stringify(['tier-1', 'tier-2']),
    };

    const mockParsedSpec = {
      parsed: {
        endpoints: [
          { method: 'GET', path: '/test', name: 'get_test' },
          { method: 'POST', path: '/test', name: 'post_test' },
        ],
        metadata: { title: 'Test API' },
      },
    };

    const mockImportRecord = {
      id: 'import-123',
      collectionId: 'collection-123',
    };

    importService.parseAndValidateSpec.mockResolvedValue(mockParsedSpec as any);
    importService.createImportRecord.mockResolvedValue(mockImportRecord as any);
    importService.transformEndpointToApiDto.mockReturnValue({} as any);
    importService.finalizeImport.mockResolvedValue(undefined);
    service.getActualImportSuccessCount.mockResolvedValue(2);

    const result = await controller.importApiSpec(ctx, params, mockFile, formData);

    expect(importService.parseAndValidateSpec).toHaveBeenCalled();
    expect(importService.createImportRecord).toHaveBeenCalled();
    expect(service.createAPI).toHaveBeenCalledTimes(2);
    expect(importService.finalizeImport).toHaveBeenCalled();
    expect(result).toHaveProperty('data.importId', 'import-123');
    expect(result).toHaveProperty('data.successCount', 2);
    expect(result).toHaveProperty('data.failedCount', 0);
  });

  it('should throw BadRequestException when no file is provided', async () => {
    const { ctx } = createMockContext();
    const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };

    await expect(controller.importApiSpec(ctx, params, undefined as any, {}))
      .rejects
      .toThrow(BadRequestException);
  });

  it('should handle partial import failures', async () => {
    const { ctx } = createMockContext();
    const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
    const mockFile = {
      buffer: Buffer.from('test spec content'),
      originalname: 'test.yaml',
    } as Express.Multer.File;
    const formData = {
      specName: 'Test Spec',
      collectionId: 'collection-123',
    };

    const mockParsedSpec = {
      parsed: {
        endpoints: [
          { method: 'GET', path: '/success', name: 'get_success' },
          { method: 'POST', path: '/failed', name: 'post_failed' },
        ],
        metadata: { title: 'Test API' },
      },
    };

    const mockImportRecord = {
      id: 'import-123',
      collectionId: 'collection-123',
    };

    importService.parseAndValidateSpec.mockResolvedValue(mockParsedSpec as any);
    importService.createImportRecord.mockResolvedValue(mockImportRecord as any);
    importService.transformEndpointToApiDto.mockReturnValue({} as any);
    
    // Mock one successful and one failed API creation
    service.createAPI.mockImplementationOnce(() => Promise.resolve({} as any))
                    .mockImplementationOnce(() => Promise.reject(new Error('Creation failed')));
    
    importService.finalizeImport.mockResolvedValue(undefined);
    service.getActualImportSuccessCount.mockResolvedValue(1);

    const result = await controller.importApiSpec(ctx, params, mockFile, formData);

    expect(result).toHaveProperty('data.successCount', 1);
    expect(result).toHaveProperty('data.failedCount', 1);
    expect(result).toHaveProperty('data.status', 'partial');
  });
});

  describe('listImports', () => {
    it('should call importService.listImports with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const pagination = { page: 1, limit: 10 };
      const expectedResponse = ResponseFormatter.success(
        'Imports fetched successfully',
        []
      );

      importService.listImports.mockResolvedValue(expectedResponse as any);

      const result = await controller.listImports(ctx, params, pagination);

      expect(importService.listImports).toHaveBeenCalledWith(
        ctx,
        params.environment,
        pagination,
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('getImport', () => {
    it('should call importService.getImport with correct parameters', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const importId = 'import-123';
      const expectedResponse = ResponseFormatter.success(
        'Import fetched successfully',
        expect.any(Object)
      );

      importService.getImport.mockResolvedValue(expectedResponse as any);

      const result = await controller.getImport(ctx, params, importId);

      expect(importService.getImport).toHaveBeenCalledWith(ctx, importId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('retryImport', () => {
    it('should retry failed import successfully', async () => {
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const importId = 'import-123';

      const mockImportRecord = {
        id: 'import-123',
        collectionId: 'collection-123',
        originalSpec: 'test spec content',
        errorLog: [{ endpoint: 'GET /failed' }],
        importStatus: 'partial',
      };

      const mockParsedSpec = {
        parsed: {
          endpoints: [
            { method: 'GET', path: '/failed', name: 'get_failed' },
            { method: 'POST', path: '/success', name: 'post_success' },
          ],
          metadata: { title: 'Test API' },
        },
      };

      const mockUpdatedRecord = {
        ...mockImportRecord,
        importStatus: 'completed',
      };

      importService.getImportForRetry.mockResolvedValue(mockImportRecord as any);
      importService.parseAndValidateSpec.mockResolvedValue(mockParsedSpec as any);
      importService.updateImportAfterRetry.mockResolvedValue(mockUpdatedRecord as any);

      const result = await controller.retryImport(ctx, params, importId);

      expect(importService.getImportForRetry).toHaveBeenCalledWith(importId);
      expect(importService.parseAndValidateSpec).toHaveBeenCalled();
      expect(service.createAPI).toHaveBeenCalledTimes(1);
      expect(importService.updateImportAfterRetry).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'import.retried',
        expect.any(ImportApiSpecEvent)
      );
      expect(result).toHaveProperty('data.importId', 'import-123');
    });
  });
});