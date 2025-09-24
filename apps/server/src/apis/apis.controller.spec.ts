import { Test, TestingModule } from '@nestjs/testing';
import { APIController } from './apis.controller';
import { APIService } from './apis.service';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { PERMISSIONS } from '@permissions/types';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createMockContext } from '@test/utils/mocks/http.mock';
import { ResponseFormatter } from '@common/utils/response/response.formatter';

describe('APIController', () => {
  let controller: APIController;
  let service: jest.Mocked<APIService>;
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
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<APIController>(APIController);
    service = module.get(APIService);
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
});
