import { Test, TestingModule } from '@nestjs/testing';
import { APIService } from './apis.service';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  CollectionRoute,
  Company,
  User,
  Collection,
} from '@common/database/entities';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { apiSuccessMessages } from './apis.constants';
import { GetAPIResponseDTO } from './dto/index.dto';
import { PERMISSIONS } from '@permissions/types';
import { CompanyTypes } from '@common/database/constants';
import {
  CollectionRouteBuilder,
  CollectionBuilder,
  UserBuilder,
  RoleBuilder,
  CompanyBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import {
  createMockContext,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { HTTP_METHODS } from './types';
import { ListServicesResponse, GetServiceResponse } from '@shared/integrations/kong/service/service.kong.interface';
import { ListRoutesResponse, CreateRouteResponse, ListPluginsResponse } from '@shared/integrations/kong/route/route.kong.interface';

describe('APIService', () => {
  // Test constants for consistent data across tests
  const TEST_ENVIRONMENT = KONG_ENVIRONMENT.DEVELOPMENT;
  const DEFAULT_PAGINATION = { page: 1, limit: 10 };
  const SECOND_PAGE_PAGINATION = { page: 2, limit: 5 };

  let service: APIService;
  let routeRepository: MockRepository<CollectionRoute>;
  let collectionRepository: MockRepository<Collection>;
  let companyRepository: MockRepository<Company>;
  let userRepository: MockRepository<User>;
  let kongServiceService: jest.Mocked<KongServiceService>;
  let kongRouteService: jest.Mocked<KongRouteService>;
  let kongConsumerService: jest.Mocked<KongConsumerService>;
  let elasticsearchService: jest.Mocked<ElasticsearchService>;
  let configService: jest.Mocked<ConfigService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let ctx: RequestContext;

  let testCompany: Company;
  let testCollection: Collection;
  let testUser: User;

  let testRoute: CollectionRoute;
  let testRouteArray: CollectionRoute[];
  let mockGatewayService: GetServiceResponse;
  let mockGatewayServices: ListServicesResponse;
  let mockGatewayRoute: CreateRouteResponse;
  let mockGatewayRoutes: ListRoutesResponse;
  let mockPlugins: ListPluginsResponse;

  beforeEach(async () => {
    testCompany = new CompanyBuilder()
      .with('id', 'test-company-id')
      .with('name', 'Test Company')
      .with('type', CompanyTypes.API_PROVIDER)
      .build();

    const testRole = new RoleBuilder()
      .with('id', 'test-role-id')
      .with('name', 'API Admin')
      .build();

    testUser = new UserBuilder()
      .with('id', 'test-user-id')
      .with('email', 'test@example.com')
      .with('company', testCompany)
      .with('role', testRole)
      .build();

    testCollection = new CollectionBuilder()
      .with('id', 'test-collection-id')
      .with('name', 'Test Collection')
      .with('slug', 'test-collection')
      .build();

    testRoute = new CollectionRouteBuilder()
      .with('id', 'test-route-id')
      .with('name', 'Test API')
      .with('slug', 'test-api')
      .with('serviceId', 'test-service-id')
      .with('routeId', 'test-route-id')
      .with('collection', testCollection)
      .with('collectionId', 'test-collection-id')
      .with('environment', TEST_ENVIRONMENT)
      .with('enabled', true)
      .with('introspectAuthorization', true)
      .with('tiers', [1, 2, 3])
      .with('url', '/test/endpoint')
      .build();

    testRouteArray = [
      testRoute,
      new CollectionRouteBuilder()
        .with('id', 'test-route-2')
        .with('name', 'Test API 2')
        .with('slug', 'test-api-2')
        .with('collection', testCollection)
        .with('environment', TEST_ENVIRONMENT)
        .with('enabled', false)
        .build(),
    ];

    mockGatewayService = {
      id: 'test-service-id',
      created_at: Date.now(),
      updated_at: Date.now(),
      protocol: 'https',
      host: 'api.example.com',
      port: 443,
      path: '/v1',
      connect_timeout: 60000,
      name: 'test-service',
      enabled: true,
      read_timeout: 60000,
      retries: 5,
      write_timeout: 60000,
      tags: ['test'],
      client_certificate: null,
    };

    mockGatewayServices = {
      data: [mockGatewayService],
    };

    mockGatewayRoute = {
      id: 'test-route-id',
      hosts: [],
      name: 'test-route',
      paths: ['/test/endpoint'],
      methods: [HTTP_METHODS.GET],
      service: { id: 'test-service-id' },
    };

    mockGatewayRoutes = {
      data: [mockGatewayRoute],
    };

    mockPlugins = {
      data: [
        {
          id: 'test-plugin-id',
          created_at: Date.now(),
          updated_at: Date.now(),
          name: 'request-transformer',
          instance_name: 'request-transformer-instance',
          protocols: ['http', 'https'],
          enabled: true,
          tags: ['transformation'],
          route: { id: 'test-route-id' },
          config: {
            http_method: 'POST',
            add: {
              headers: ['Authorization:Bearer token'],
              querystring: ['param:value'],
              body: ['field:data'],
            },
          },
        },
      ],
    };

    ctx = createMockContext({
      user: testUser,
      permissions: [PERMISSIONS.ADD_API_ENDPOINT],
    }).ctx;

    // Initialize all repository mocks with clean state
    routeRepository = createMockRepository<CollectionRoute>();
    collectionRepository = createMockRepository<Collection>();
    companyRepository = createMockRepository<Company>();
    userRepository = createMockRepository<User>();

    // Setup Kong service mocks for external API interactions
    kongServiceService = {
      createService: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
      getService: jest.fn(),
      listServices: jest.fn(),
    } as any;

    kongRouteService = {
      createRoute: jest.fn(),
      updateRoute: jest.fn(),
      deleteRoute: jest.fn(),
      getRoute: jest.fn(),
      listRoutes: jest.fn(),
      getPlugins: jest.fn(),
    } as any;

    kongConsumerService = {
      getConsumerAcls: jest.fn(),
      addConsumerAcl: jest.fn(),
      removeConsumerAcl: jest.fn(),
    } as any;

    elasticsearchService = {
      search: jest.fn(),
    } as any;

    configService = {
      get: jest.fn(),
    } as any;

    eventEmitter = mockEventEmitter();

    // Create testing module with all dependencies injected
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        APIService,
        { provide: 'CollectionRepository', useValue: collectionRepository },
        { provide: 'CompanyRepository', useValue: companyRepository },
        { provide: 'CollectionRouteRepository', useValue: routeRepository },
        { provide: 'UserRepository', useValue: userRepository },
        { provide: KongServiceService, useValue: kongServiceService },
        { provide: KongRouteService, useValue: kongRouteService },
        { provide: KongConsumerService, useValue: kongConsumerService },
        { provide: ElasticsearchService, useValue: elasticsearchService },
        { provide: ConfigService, useValue: configService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<APIService>(APIService);
  });

  afterEach(() => {
    // Reset all mocks to ensure test isolation
    jest.clearAllMocks();
  });

  describe('View APIs', () => {
    it('should return paginated list of API routes for the specified environment with filtering support', async () => {
      const pagination = DEFAULT_PAGINATION;
      const filters = { name: 'Payment API' };

      routeRepository.findAndCount.mockResolvedValue([testRouteArray, 2]);
      kongServiceService.listServices.mockResolvedValue(mockGatewayServices);
      kongRouteService.listRoutes.mockResolvedValue(mockGatewayRoutes);

      const result = await service.viewAPIs(ctx, TEST_ENVIRONMENT, pagination, filters);

      expect(routeRepository.findAndCount).toHaveBeenCalledWith({
        where: { ...filters, environment: TEST_ENVIRONMENT },
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { collection: true },
      });
      expect(routeRepository.findAndCount).toHaveBeenCalledTimes(1);

      expect(kongServiceService.listServices).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        tags: 'test-collection',
      });
      expect(kongServiceService.listServices).toHaveBeenCalledTimes(1);

      expect(kongRouteService.listRoutes).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        tags: 'test-collection',
      });
      expect(kongRouteService.listRoutes).toHaveBeenCalledTimes(1);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.fetchedAPIs,
          expect.arrayContaining([
            expect.objectContaining({
              id: 'test-route-id',
              name: 'Test API',
              enabled: true,
              tiers: [1, 2, 3],
            }),
            expect.objectContaining({
              id: 'test-route-2',
              name: 'Test API 2',
              enabled: false,
            }),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: 2,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.view',
        expect.objectContaining({
          author: ctx.activeUser,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should return response with pagination metadata for total records, pages, current page and page size', async () => {
      const pagination = SECOND_PAGE_PAGINATION;
      
      routeRepository.findAndCount.mockResolvedValue([testRouteArray, 23]); // 23 total records
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      const result = await service.viewAPIs(ctx, TEST_ENVIRONMENT, pagination);

      expect(result.meta).toEqual({
        totalNumberOfRecords: 23,
        totalNumberOfPages: 5, // Math.ceil(23 / 5)
        pageNumber: 2,
        pageSize: 5,
      });

      expect(routeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          take: 5,
        }),
      );
      expect(routeRepository.findAndCount).toHaveBeenCalledTimes(1);
    });

    it('should return APIs in standardized DTO format on success', async () => {
      const pagination = { page: 1, limit: 10 };

      routeRepository.findAndCount.mockResolvedValue([[testRoute], 1]);
      kongServiceService.listServices.mockResolvedValue(mockGatewayServices);
      kongRouteService.listRoutes.mockResolvedValue(mockGatewayRoutes);

      const result = await service.viewAPIs(ctx, TEST_ENVIRONMENT, pagination);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.fetchedAPIs,
          expect.arrayContaining([
            expect.any(GetAPIResponseDTO),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: expect.any(Number),
            totalNumberOfPages: expect.any(Number),
            pageNumber: expect.any(Number),
            pageSize: expect.any(Number),
          }),
        ),
      );

      const apiDto = result.data![0];
      expect(apiDto).toHaveProperty('id');
      expect(apiDto).toHaveProperty('name');
      expect(apiDto).toHaveProperty('slug');
      expect(apiDto).toHaveProperty('enabled');
      expect(apiDto).toHaveProperty('introspectAuthorization');
      expect(apiDto).toHaveProperty('collectionId');
      expect(apiDto).toHaveProperty('tiers');
      expect(apiDto).toHaveProperty('upstream');
      expect(apiDto).toHaveProperty('downstream');
    });

    it('should retrieve API by ID for the specified environment', async () => {
      const apiId = 'test-api-id';

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [] });

      const result = await service.viewAPI(ctx, TEST_ENVIRONMENT, apiId);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: expect.objectContaining({ _type: 'equal', _value: apiId }), environment: TEST_ENVIRONMENT },
          { name: expect.objectContaining({ _type: 'equal', _value: apiId }), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });
      expect(routeRepository.findOne).toHaveBeenCalledTimes(1);

      expect(kongServiceService.getService).toHaveBeenCalledWith(TEST_ENVIRONMENT, 'test-service-id');
      expect(kongServiceService.getService).toHaveBeenCalledTimes(1);

      expect(kongRouteService.getRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, 'test-route-id');
      expect(kongRouteService.getRoute).toHaveBeenCalledTimes(1);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.fetchedAPI,
          expect.any(GetAPIResponseDTO),
        ),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.view',
        expect.objectContaining({
          author: ctx.activeUser,
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });

    it('should retrieve API by slug for the specified environment', async () => {
      const apiSlug = 'payment-api';

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [] });

      const result = await service.viewAPI(ctx, TEST_ENVIRONMENT, apiSlug);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: expect.objectContaining({ _type: 'equal', _value: apiSlug }), environment: TEST_ENVIRONMENT },
          { name: expect.objectContaining({ _type: 'equal', _value: apiSlug }), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });
      expect(routeRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should include all API details with upstream, downstream, plugins, and collection in response', async () => {
      const apiId = 'detailed-api-id';

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue(mockPlugins);

      const result = await service.viewAPI(ctx, TEST_ENVIRONMENT, apiId);

      const apiData = result.data;
      expect(apiData).toEqual(
        expect.objectContaining({
          id: 'test-route-id',
          name: 'Test API',
          slug: 'test-api',
          enabled: true,
          introspectAuthorization: true,
          collectionId: 'test-collection-id',
          tiers: [1, 2, 3],
          upstream: expect.objectContaining({
            url: 'https://api.example.com:443/v1',
            method: 'POST',
            headers: expect.arrayContaining([
              expect.objectContaining({ key: 'Authorization', value: 'Bearer token' }),
            ]),
            querystring: expect.arrayContaining([
              expect.objectContaining({ key: 'param', value: 'value' }),
            ]),
            body: expect.arrayContaining([
              expect.objectContaining({ key: 'field', value: 'data' }),
            ]),
          }),
          downstream: expect.objectContaining({
            path: '/test/endpoint',
            method: HTTP_METHODS.GET,
          }),
        }),
      );
    });

    it('should throw NotFound error when API does not exist', async () => {
      const nonExistentId = 'non-existent-api-id';
      
      routeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.viewAPI(ctx, TEST_ENVIRONMENT, nonExistentId),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`API '${nonExistentId}' does not exist`),
        }),
      );

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: expect.objectContaining({ _type: 'equal', _value: nonExistentId }), environment: TEST_ENVIRONMENT },
          { name: expect.objectContaining({ _type: 'equal', _value: nonExistentId }), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });
      expect(routeRepository.findOne).toHaveBeenCalledTimes(1);

      expect(kongServiceService.getService).not.toHaveBeenCalled();
      expect(kongRouteService.getRoute).not.toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
