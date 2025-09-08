import { Test, TestingModule } from '@nestjs/testing';
import { CollectionsService } from './collections.service';
import {
  Collection,
  CollectionRoute,
  Company,
} from '@common/database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  CollectionBuilder,
  CollectionRouteBuilder,
  CompanyBuilder,
  UserBuilder,
  RoleBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import {
  createMockContext,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import {
  collectionsSuccessMessages,
} from './collections.constants';
import {
  CreateCollectionDto,
  UpdateCollectionDto,
  GetCollectionResponseDTO,
} from './dto/index.dto';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { PERMISSIONS } from '@permissions/types';
import { Equal } from 'typeorm';

/**
 * CollectionsService Unit Tests
 * 
 * This test suite covers all public methods of the CollectionsService class:
 * - listCollections: Pagination and filtering of collections
 * - viewCollection: Retrieving collections by ID or slug
 * - createCollection: Creating new collections with validation
 * - updateCollection: Updating existing collections
 * - deleteCollection: Soft deletion with route validation
 * - getCollectionsAssignedToCompany: Kong ACL integration for company-specific collections
 * 
 * Test coverage includes:
 * ✓ Happy path scenarios
 * ✓ Error handling and validation
 * ✓ Edge cases and boundary conditions
 * ✓ Kong integration for development/production environments
 * ✓ Proper audit logging through EventEmitter
 */
describe('CollectionsService', () => {
  // Test constants for consistent data across tests
  const TEST_COLLECTION_ID = 'test-collection-id';
  
  // Standard pagination for testing
  const DEFAULT_PAGINATION = { page: 1, limit: 10 };
  const SECOND_PAGE_PAGINATION = { page: 2, limit: 5 };
  let service: CollectionsService;
  let collectionRepository: MockRepository<Collection>;
  let routeRepository: MockRepository<CollectionRoute>;
  let companyRepository: MockRepository<Company>;
  let kongServiceService: jest.Mocked<KongServiceService>;
  let kongRouteService: jest.Mocked<KongRouteService>;
  let kongConsumerService: jest.Mocked<KongConsumerService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let ctx: RequestContext;

  beforeEach(async () => {
    // Create test data with proper user and company context
    const testUser = new UserBuilder()
      .with('company', new CompanyBuilder().build())
      .with('role', new RoleBuilder().build())
      .build();

    ctx = createMockContext({
      user: testUser,
      permissions: [PERMISSIONS.ADD_TEAM_MEMBERS],
    }).ctx;

    // Initialize all repository mocks with clean state
    collectionRepository = createMockRepository<Collection>();
    routeRepository = createMockRepository<CollectionRoute>();
    companyRepository = createMockRepository<Company>();

    // Setup Kong service mocks for external API interactions
    kongServiceService = {
      createService: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
      getService: jest.fn(),
    } as any;

    kongRouteService = {
      createRoute: jest.fn(),
      updateRoute: jest.fn(),
      deleteRoute: jest.fn(),
      getRoute: jest.fn(),
    } as any;

    kongConsumerService = {
      getConsumerAcls: jest.fn(),
      addConsumerAcl: jest.fn(),
      removeConsumerAcl: jest.fn(),
    } as any;

    eventEmitter = mockEventEmitter();

    // Create testing module with all dependencies injected
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        { provide: 'CollectionRepository', useValue: collectionRepository },
        { provide: 'CollectionRouteRepository', useValue: routeRepository },
        { provide: 'CompanyRepository', useValue: companyRepository },
        { provide: KongServiceService, useValue: kongServiceService },
        { provide: KongRouteService, useValue: kongRouteService },
        { provide: KongConsumerService, useValue: kongConsumerService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<CollectionsService>(CollectionsService);
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    jest.clearAllMocks();
  });

  describe('listCollections', () => {
    it('should return paginated collections successfully', async () => {
      const pagination = DEFAULT_PAGINATION;
      const mockCollections = [
        new CollectionBuilder()
          .with('id', 'collection1')
          .with('name', 'Test Collection 1')
          .with('apis', [])
          .build(),
        new CollectionBuilder()
          .with('id', 'collection2')
          .with('name', 'Test Collection 2')
          .with('apis', [])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 2]);

      const result = await service.listCollections(ctx, pagination);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { apis: true },
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.fetchedCollections,
          expect.arrayContaining([
            expect.objectContaining({ id: 'collection1', name: 'Test Collection 1' }),
            expect.objectContaining({ id: 'collection2', name: 'Test Collection 2' }),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: 2,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should apply name filter when provided in listCollections', async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: 'Payment APIs' };
      const mockCollections = [
        new CollectionBuilder()
          .with('name', 'Payment APIs')
          .with('apis', [])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 1]);

      const result = await service.listCollections(ctx, pagination, filters);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { apis: true },
      });
    });

    it('should apply slug filter when provided', async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { slug: 'payment-apis' };
      const mockCollections = [
        new CollectionBuilder()
          .with('slug', 'payment-apis')
          .with('apis', [])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 1]);

      await service.listCollections(ctx, pagination, filters);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { apis: true },
      });
    });

    it('should apply createdAt filter when provided', async () => {
      const pagination = { page: 1, limit: 10 };
      const createdDate = new Date('2024-01-01');
      const filters = { createdAt: createdDate };
      const mockCollections = [
        new CollectionBuilder()
          .with('createdAt', createdDate)
          .with('apis', [])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 1]);

      await service.listCollections(ctx, pagination, filters);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { apis: true },
      });
    });

    it('should apply multiple filters simultaneously', async () => {
      const pagination = { page: 1, limit: 5 };
      const filters = { 
        name: 'Payment', 
        slug: 'payment-apis',
        createdAt: new Date('2024-01-01')
      };
      const mockCollections = [
        new CollectionBuilder()
          .with('name', 'Payment')
          .with('slug', 'payment-apis')
          .with('apis', [])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 1]);

      await service.listCollections(ctx, pagination, filters);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: filters,
        skip: 0,
        take: 5,
        order: { name: 'ASC' },
        relations: { apis: true },
      });
    });

    it('should calculate correct offset for second page pagination', async () => {
      const pagination = SECOND_PAGE_PAGINATION;
      const mockCollections = [new CollectionBuilder().with('apis', []).build()];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 6]);

      await service.listCollections(ctx, pagination);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: 5, 
        take: 5,
        order: { name: 'ASC' },
        relations: { apis: true },
      });
    });

    it('should include APIs with tiers in response', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockApi = new CollectionRouteBuilder()
        .with('id', 'api-1')
        .with('name', 'Payment API')
        .with('tiers', [1, 2])
        .build();
      const mockCollections = [
        new CollectionBuilder()
          .with('id', 'collection1')
          .with('apis', [mockApi])
          .build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 1]);

      const result = await service.listCollections(ctx, pagination);

      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: 'collection1',
            apis: expect.arrayContaining([
              expect.objectContaining({
                id: 'api-1',
                name: 'Payment API',
                tiers: [1, 2],
              }),
            ]),
          }),
        ]),
      );
    });

    it('should handle empty results correctly', async () => {
      const pagination = { page: 1, limit: 10 };
      const filters = { name: 'NonExistent' };
      
      collectionRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.listCollections(ctx, pagination, filters);

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.fetchedCollections,
          [],
          expect.objectContaining({
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should sort collections by name in ascending order', async () => {
      const pagination = { page: 1, limit: 10 };
      const mockCollections = [
        new CollectionBuilder().with('name', 'A Collection').with('apis', []).build(),
        new CollectionBuilder().with('name', 'Z Collection').with('apis', []).build(),
      ];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 2]);

      await service.listCollections(ctx, pagination);

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });

    it('should calculate pagination metadata correctly for multiple pages', async () => {
      const pagination = { page: 3, limit: 5 };
      const mockCollections = [new CollectionBuilder().with('apis', []).build()];
      
      collectionRepository.findAndCount.mockResolvedValue([mockCollections, 23]); // 23 total records

      const result = await service.listCollections(ctx, pagination);

      expect(result.meta).toEqual({
        totalNumberOfRecords: 23,
        totalNumberOfPages: 5, 
        pageNumber: 3,
        pageSize: 5,
      });

      expect(collectionRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10, 
          take: 5,
        }),
      );
    });
  });

  describe('viewCollection', () => {
    it('should return collection by ID successfully', async () => {
      const collectionId = 'test-collection-id';
      const mockCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();
      
      collectionRepository.findOne.mockResolvedValue(mockCollection);

      const result = await service.viewCollection(ctx, collectionId);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: [{ id: Equal(collectionId) }, { slug: Equal(collectionId) }],
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.fetchedCollection,
          new GetCollectionResponseDTO(mockCollection),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should return collection by slug successfully', async () => {
      const collectionSlug = 'test-collection-slug';
      const mockCollection = new CollectionBuilder()
        .with('slug', collectionSlug)
        .build();
      
      collectionRepository.findOne.mockResolvedValue(mockCollection);

      const result = await service.viewCollection(ctx, collectionSlug);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: [{ id: Equal(collectionSlug) }, { slug: Equal(collectionSlug) }],
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.fetchedCollection,
          new GetCollectionResponseDTO(mockCollection),
        ),
      );
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      const collectionId = 'non-existent-id';
      collectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.viewCollection(ctx, collectionId),
      ).rejects.toThrow(INotFoundException);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: [{ id: Equal(collectionId) }, { slug: Equal(collectionId) }],
      });
    });

    it('should emit ViewCollectionEvent on successful retrieval', async () => {
      const collectionId = 'test-collection-id';
      const mockCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();
      
      collectionRepository.findOne.mockResolvedValue(mockCollection);

      await service.viewCollection(ctx, collectionId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'collections.view',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            collection: mockCollection,
          }),
        }),
      );
    });
  });

  describe('createCollection', () => {
    it('should create collection successfully', async () => {
      const createDto: CreateCollectionDto = {
        name: 'New Collection',
        description: 'Test description',
      };
      
      const expectedCollection = new CollectionBuilder()
        .with('name', createDto.name)
        .with('slug', 'new-collection')
        .with('description', createDto.description)
        .build();

      collectionRepository.countBy.mockResolvedValue(0);
      collectionRepository.create.mockReturnValue(expectedCollection);
      collectionRepository.save.mockResolvedValue(expectedCollection);

      const result = await service.createCollection(ctx, createDto);

      expect(collectionRepository.countBy).toHaveBeenCalledWith({
        name: createDto.name,
      });

      expect(collectionRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        slug: 'new-collection',
        description: createDto.description,
      });

      expect(collectionRepository.save).toHaveBeenCalledWith(expectedCollection);

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.createdCollection,
          new GetCollectionResponseDTO(expectedCollection),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw BadRequestException when collection name already exists', async () => {
      const createDto: CreateCollectionDto = {
        name: 'Existing Collection',
        description: 'Test description',
      };
      
      collectionRepository.countBy.mockResolvedValue(1);

      await expect(
        service.createCollection(ctx, createDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.countBy).toHaveBeenCalledWith({
        name: createDto.name,
      });

      expect(collectionRepository.create).not.toHaveBeenCalled();
      expect(collectionRepository.save).not.toHaveBeenCalled();
    });

    it('should generate correct slug from collection name', async () => {
      const createDto: CreateCollectionDto = {
        name: 'Test Collection with Spaces & Special Chars!',
        description: 'Test description',
      };
      
      const expectedCollection = new CollectionBuilder().build();
      
      collectionRepository.countBy.mockResolvedValue(0);
      collectionRepository.create.mockReturnValue(expectedCollection);
      collectionRepository.save.mockResolvedValue(expectedCollection);

      await service.createCollection(ctx, createDto);

      expect(collectionRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        slug: 'test-collection-with-spaces-and-special-chars',
        description: createDto.description,
      });
    });

    it('should throw BadRequestException when name is empty', async () => {
      const createDto: CreateCollectionDto = {
        name: '',
        description: 'Test description',
      };

      await expect(
        service.createCollection(ctx, createDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.countBy).not.toHaveBeenCalled();
      expect(collectionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when name is only whitespace', async () => {
      const createDto: CreateCollectionDto = {
        name: '   ',
        description: 'Test description',
      };

      await expect(
        service.createCollection(ctx, createDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.countBy).not.toHaveBeenCalled();
      expect(collectionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when description is empty', async () => {
      const createDto: CreateCollectionDto = {
        name: 'Test Collection',
        description: '',
      };

      await expect(
        service.createCollection(ctx, createDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.countBy).not.toHaveBeenCalled();
      expect(collectionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when description is only whitespace', async () => {
      const createDto: CreateCollectionDto = {
        name: 'Test Collection',
        description: '   ',
      };

      await expect(
        service.createCollection(ctx, createDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.countBy).not.toHaveBeenCalled();
      expect(collectionRepository.create).not.toHaveBeenCalled();
    });

    it('should emit CreateCollectionEvent on successful creation', async () => {
      const createDto: CreateCollectionDto = {
        name: 'New Collection',
        description: 'Test description',
      };
      
      const expectedCollection = new CollectionBuilder()
        .with('name', createDto.name)
        .with('slug', 'new-collection')
        .with('description', createDto.description)
        .build();

      collectionRepository.countBy.mockResolvedValue(0);
      collectionRepository.create.mockReturnValue(expectedCollection);
      collectionRepository.save.mockResolvedValue(expectedCollection);

      await service.createCollection(ctx, createDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'collections.create',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            collection: expectedCollection,
          }),
        }),
      );
    });
  });

  describe('updateCollection', () => {
    it('should update collection successfully', async () => {
      const collectionId = 'test-collection-id';
      const updateDto: UpdateCollectionDto = {
        description: 'Updated description',
      };
      
      const existingCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();

      collectionRepository.findOne.mockResolvedValue(existingCollection);
      collectionRepository.create.mockReturnValue({ description: updateDto.description });
      collectionRepository.update.mockResolvedValue({ affected: 1 } as any);

      const result = await service.updateCollection(ctx, collectionId, updateDto);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(collectionId) },
      });

      expect(collectionRepository.create).toHaveBeenCalledWith({
        description: updateDto.description,
      });

      expect(collectionRepository.update).toHaveBeenCalledWith(
        { id: collectionId },
        { description: updateDto.description },
      );

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.updatedCollection,
          new GetCollectionResponseDTO(existingCollection),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      const collectionId = 'non-existent-id';
      const updateDto: UpdateCollectionDto = {
        description: 'Updated description',
      };
      
      collectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCollection(ctx, collectionId, updateDto),
      ).rejects.toThrow(INotFoundException);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(collectionId) },
      });

      expect(collectionRepository.update).not.toHaveBeenCalled();
    });

    it('should emit UpdateCollectionEvent on successful update', async () => {
      const collectionId = 'test-collection-id';
      const updateDto: UpdateCollectionDto = {
        description: 'Updated description',
      };
      
      const existingCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();

      collectionRepository.findOne.mockResolvedValue(existingCollection);
      collectionRepository.create.mockReturnValue({ description: updateDto.description });
      collectionRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.updateCollection(ctx, collectionId, updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'collections.update',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            collection: expect.objectContaining({
              ...existingCollection,
              description: updateDto.description,
            }),
          }),
        }),
      );
    });

    it('should throw BadRequestException when description is empty', async () => {
      const collectionId = 'test-collection-id';
      const updateDto: UpdateCollectionDto = {
        description: '',
      };

      await expect(
        service.updateCollection(ctx, collectionId, updateDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.findOne).not.toHaveBeenCalled();
      expect(collectionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when description is only whitespace', async () => {
      const collectionId = 'test-collection-id';
      const updateDto: UpdateCollectionDto = {
        description: '   ',
      };

      await expect(
        service.updateCollection(ctx, collectionId, updateDto),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.findOne).not.toHaveBeenCalled();
      expect(collectionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCollection', () => {
    it('should delete collection successfully when no routes exist', async () => {
      const collectionId = 'test-collection-id';
      const existingCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();

      collectionRepository.findOne.mockResolvedValue(existingCollection);
      routeRepository.find.mockResolvedValue([]);
      collectionRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteCollection(ctx, collectionId);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(collectionId) },
      });

      expect(routeRepository.find).toHaveBeenCalledWith({
        where: { collectionId: Equal(collectionId) },
      });

      expect(collectionRepository.softDelete).toHaveBeenCalledWith({
        id: collectionId,
      });

      expect(result).toEqual(
        ResponseFormatter.success(collectionsSuccessMessages.deletedCollection),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw NotFoundException when collection does not exist', async () => {
      const collectionId = 'non-existent-id';
      collectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteCollection(ctx, collectionId),
      ).rejects.toThrow(INotFoundException);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(collectionId) },
      });

      expect(routeRepository.find).not.toHaveBeenCalled();
      expect(collectionRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when collection has routes', async () => {
      const collectionId = 'test-collection-id';
      const existingCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();
      const existingRoutes = [
        new CollectionRouteBuilder().with('collectionId', collectionId).build(),
      ];

      collectionRepository.findOne.mockResolvedValue(existingCollection);
      routeRepository.find.mockResolvedValue(existingRoutes);

      await expect(
        service.deleteCollection(ctx, collectionId),
      ).rejects.toThrow(IBadRequestException);

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(collectionId) },
      });

      expect(routeRepository.find).toHaveBeenCalledWith({
        where: { collectionId: Equal(collectionId) },
      });

      expect(collectionRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should emit DeleteCollectionEvent on successful deletion', async () => {
      const collectionId = 'test-collection-id';
      const existingCollection = new CollectionBuilder()
        .with('id', collectionId)
        .build();

      collectionRepository.findOne.mockResolvedValue(existingCollection);
      routeRepository.find.mockResolvedValue([]);
      collectionRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteCollection(ctx, collectionId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'collections.delete',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            collection: existingCollection,
          }),
        }),
      );
    });
  });

  describe('getCollectionsAssignedToCompany', () => {
    const createMockQueryBuilder = (collections: any[] = [], count = 0) => ({
      createQueryBuilder: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      addGroupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue(collections),
      getCount: jest.fn().mockResolvedValue(count),
    });

    it('should return collections with proper pagination and response format', async () => {
      const companyId = 'test-company-id';
      const environment = KONG_ENVIRONMENT.DEVELOPMENT;
      const pagination = { page: 1, limit: 10 };
      const mockCompany = new CompanyBuilder().with('id', companyId).build();
      const mockCollections = [
        { id: 'col1', name: 'Payment APIs', description: 'Payment collection', slug: 'payment-apis', routeCount: '5' },
      ];

      companyRepository.findOne.mockResolvedValue(mockCompany);
      collectionRepository.createQueryBuilder.mockReturnValue(createMockQueryBuilder(mockCollections, 1) as any);

      const result = await service.getCollectionsAssignedToCompany(ctx, environment, companyId, pagination);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(companyId) },
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          collectionsSuccessMessages.fetchedCollection,
          expect.arrayContaining([
            expect.objectContaining({
              id: 'col1',
              name: 'Payment APIs',
              description: 'Payment collection',
              slug: 'payment-apis',
              routeCount: '5',
            }),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: 1,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw BadRequestException when company does not exist', async () => {
      const companyId = 'non-existent-company';
      const environment = KONG_ENVIRONMENT.DEVELOPMENT;
      const pagination = { page: 1, limit: 10 };

      companyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getCollectionsAssignedToCompany(ctx, environment, companyId, pagination),
      ).rejects.toThrow(IBadRequestException);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(companyId) },
      });
    });

    it('should use context company ID when companyId is not provided', async () => {
      const environment = KONG_ENVIRONMENT.DEVELOPMENT;
      const pagination = { page: 1, limit: 10 };
      const mockCompany = new CompanyBuilder().with('id', ctx.activeCompany.id).build();

      companyRepository.findOne.mockResolvedValue(mockCompany);
      collectionRepository.createQueryBuilder.mockReturnValue(createMockQueryBuilder() as any);

      await service.getCollectionsAssignedToCompany(ctx, environment, undefined, pagination);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(ctx.activeCompany.id) },
      });
    });

    it('should fetch Kong ACLs for production environment', async () => {
      const companyId = 'test-company-id';
      const environment = KONG_ENVIRONMENT.PRODUCTION;
      const pagination = { page: 1, limit: 10 };
      const mockCompany = new CompanyBuilder().with('id', companyId).build();

      companyRepository.findOne.mockResolvedValue(mockCompany);
      
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: [
          { group: 'tier-premium', created_at: Date.now(), id: 'acl1' },
          { group: 'route-test-route', created_at: Date.now(), id: 'acl2' },
        ],
        offset: '',
      });

      const mockQueryBuilder = createMockQueryBuilder();
      collectionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getCollectionsAssignedToCompany(ctx, environment, companyId, pagination);

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(environment, companyId, undefined);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'route.id IN (:routes) OR route.tiers IN (:tiers)',
        {
          routes: ['test-route'],
          tiers: ['premium'],
        },
      );
    });

    it('should support filtering by name and slug', async () => {
      const companyId = 'test-company-id';
      const environment = KONG_ENVIRONMENT.DEVELOPMENT;
      const pagination = { page: 1, limit: 10 };
      const filters = { name: 'Payment', slug: 'payment-apis' };
      const mockCompany = new CompanyBuilder().with('id', companyId).build();

      companyRepository.findOne.mockResolvedValue(mockCompany);
      
      const mockQueryBuilder = createMockQueryBuilder();
      collectionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.getCollectionsAssignedToCompany(ctx, environment, companyId, pagination, filters);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        "collection.name LIKE '%Payment%' AND collection.slug LIKE '%payment-apis%'",
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
