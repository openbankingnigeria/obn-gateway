import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PERMISSIONS } from '@permissions/types';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createMockContext } from '@test/utils/mocks/http.mock';
import { 
  UserBuilder, 
  CompanyBuilder, 
  RoleBuilder 
} from '@test/utils/builders';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { collectionsSuccessMessages } from './collections.constants';
import { GetCollectionResponseDTO } from './dto/index.dto';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

/**
 * CollectionsController Unit Tests
 * 
 * This test suite focuses on testing the controller layer, particularly:
 * - Permission enforcement via @RequiredPermission decorators
 * - Request/response handling
 * - Parameter validation and transformation
 * - Integration between controller and service layers
 */
describe('CollectionsController', () => {
  let controller: CollectionsController;
  let service: jest.Mocked<CollectionsService>;
  let reflector: Reflector;

  // Mock service methods
  const mockService = {
    listCollections: jest.fn(),
    viewCollection: jest.fn(),
    createCollection: jest.fn(),
    updateCollection: jest.fn(),
    deleteCollection: jest.fn(),
    getCollectionsAssignedToCompany: jest.fn(),
  };

  // Mock ConfigService for APIInterceptor
  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [
        {
          provide: CollectionsService,
          useValue: mockService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<CollectionsController>(CollectionsController);
    service = module.get(CollectionsService);
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

    it('should require LIST_API_COLLECTIONS permission for listCollections', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.listCollections);
      expect(permissions).toEqual(PERMISSIONS.LIST_API_COLLECTIONS);
    });

    it('should require CREATE_API_COLLECTION permission for createCollection', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.createCollection);
      expect(permissions).toEqual(PERMISSIONS.CREATE_API_COLLECTION);
    });

    it('should require VIEW_API_COLLECTION permission for viewCollection', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewCollection);
      expect(permissions).toEqual(PERMISSIONS.VIEW_API_COLLECTION);
    });

    it('should require UPDATE_API_COLLECTION permission for updateCollection', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.updateCollection);
      expect(permissions).toEqual(PERMISSIONS.UPDATE_API_COLLECTION);
    });

    it('should require DELETE_API_COLLECTION permission for deleteCollection', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.deleteCollection);
      expect(permissions).toEqual(PERMISSIONS.DELETE_API_COLLECTION);
    });

    it('should require VIEW_ASSIGNED_API_ENDPOINTS permission for viewMyCompanyApis', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewMyCompanyApis);
      expect(permissions).toEqual(PERMISSIONS.VIEW_ASSIGNED_API_ENDPOINTS);
    });

    it('should require AP_VIEW_ASSIGNED_API_ENDPOINTS permission for viewCompanyApis', () => {
      const permissions = reflector.get<string>('allowed_permissions', controller.viewCompanyApis);
      expect(permissions).toEqual(PERMISSIONS.AP_VIEW_ASSIGNED_API_ENDPOINTS);
    });
  });
});
