import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { PERMISSIONS } from '@permissions/types';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createMockContext } from '@test/utils/mocks/http.mock';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { collectionsSuccessMessages } from './collections.constants';
import { GetCollectionResponseDTO, GetCompanyCollectionResponseDTO } from './dto/index.dto';
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

  describe('listCollections', () => {
    it('should call collectionsService.listCollections with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const mockCollections: GetCollectionResponseDTO[] = [
        new GetCollectionResponseDTO({
          id: '1',
          name: 'Test Collection',
          description: 'Test Description',
          slug: 'test-collection',
          createdAt: new Date(),
          apis: []
        })
      ];
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.fetchedCollections,
        mockCollections
      );

      service.listCollections.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.listCollections(ctx, pagination, filters);

      // Assert
      expect(service.listCollections).toHaveBeenCalledWith(ctx, pagination, filters);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('createCollection', () => {
    it('should call collectionsService.createCollection with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const createData = {
        name: 'Test Collection',
        description: 'Test Description',
      };
      const mockCollection = new GetCollectionResponseDTO({
        id: '123',
        name: createData.name,
        description: createData.description,
        slug: 'test-collection',
        createdAt: new Date(),
        apis: []
      });
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.createdCollection,
        mockCollection
      );

      service.createCollection.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.createCollection(ctx, createData);

      // Assert
      expect(service.createCollection).toHaveBeenCalledWith(ctx, createData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewCollection', () => {
    it('should call collectionsService.viewCollection with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const collectionId = '123';
      const mockCollection = new GetCollectionResponseDTO({
        id: collectionId,
        name: 'Test Collection',
        description: 'Test Description',
        slug: 'test-collection',
        createdAt: new Date(),
        apis: []
      });
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.fetchedCollection,
        mockCollection
      );

      service.viewCollection.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.viewCollection(ctx, collectionId);

      // Assert
      expect(service.viewCollection).toHaveBeenCalledWith(ctx, collectionId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('updateCollection', () => {
    it('should call collectionsService.updateCollection with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const collectionId = '123';
      const updateData = {
        description: 'Updated Description',
      };
      const mockCollection = new GetCollectionResponseDTO({
        id: collectionId,
        name: 'Test Collection',
        description: updateData.description,
        slug: 'test-collection',
        createdAt: new Date(),
        apis: []
      });
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.updatedCollection,
        mockCollection
      );

      service.updateCollection.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.updateCollection(ctx, collectionId, updateData);

      // Assert
      expect(service.updateCollection).toHaveBeenCalledWith(ctx, collectionId, updateData);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('deleteCollection', () => {
    it('should call collectionsService.deleteCollection with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const collectionId = '123';
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.deletedCollection
      );

      service.deleteCollection.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.deleteCollection(ctx, collectionId);

      // Assert
      expect(service.deleteCollection).toHaveBeenCalledWith(ctx, collectionId);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewMyCompanyApis', () => {
    it('should call collectionsService.getCollectionsAssignedToCompany with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.PRODUCTION };
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const mockCollections: GetCompanyCollectionResponseDTO[] = [
        new GetCompanyCollectionResponseDTO({
          id: '1',
          name: 'Test Collection',
          description: 'Test Description',
          routeCount: '5'
        })
      ];
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.fetchedCollections,
        mockCollections
      );

      service.getCollectionsAssignedToCompany.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.viewMyCompanyApis(ctx, params, pagination, filters);

      // Assert
      expect(service.getCollectionsAssignedToCompany).toHaveBeenCalledWith(
        ctx,
        params.environment,
        undefined,
        pagination,
        filters
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('viewCompanyApis', () => {
    it('should call collectionsService.getCollectionsAssignedToCompany with correct parameters', async () => {
      // Arrange
      const { ctx } = createMockContext();
      const params = { environment: KONG_ENVIRONMENT.DEVELOPMENT };
      const companyId = 'company-123';
      const pagination = { page: 1, limit: 10 };
      const filters = { search: 'test' };
      const mockCollections: GetCompanyCollectionResponseDTO[] = [
        new GetCompanyCollectionResponseDTO({
          id: '1',
          name: 'Test Collection',
          description: 'Test Description',
          routeCount: '3'
        })
      ];
      const expectedResponse = ResponseFormatter.success(
        collectionsSuccessMessages.fetchedCollections,
        mockCollections
      );

      service.getCollectionsAssignedToCompany.mockResolvedValue(expectedResponse);

      // Act
      const result = await controller.viewCompanyApis(ctx, params, companyId, pagination, filters);

      // Assert
      expect(service.getCollectionsAssignedToCompany).toHaveBeenCalledWith(
        ctx,
        params.environment,
        companyId,
        pagination,
        filters
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
