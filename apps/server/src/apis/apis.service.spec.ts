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
import { ListServicesResponse, GetServiceResponse, CreateServiceResponse } from '@shared/integrations/kong/service/service.kong.interface';
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
  
  // Specialized test entities for assignment/unassignment scenarios
  let testCompanyForAssignment: Company;
  let testCompanyForUnassignment: Company;
  let testApiRoutesForAssignment: CollectionRoute[];
  let testApiRoutesForUnassignment: CollectionRoute[];
  let mockGatewayService: GetServiceResponse;
  let mockCreateGatewayService: CreateServiceResponse;
  let mockGatewayServices: ListServicesResponse;
  let mockGatewayRoute: CreateRouteResponse;
  let mockGatewayRoutes: ListRoutesResponse;
  let mockPlugins: ListPluginsResponse;

  let testCreateDto: any;
  let testUpdateDto: any;

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

    mockCreateGatewayService = {
      ...mockGatewayService,
      url: 'https://api.example.com/v1',
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

    routeRepository = createMockRepository<CollectionRoute>();
    collectionRepository = createMockRepository<Collection>();
    companyRepository = createMockRepository<Company>();
    userRepository = createMockRepository<User>();

    kongServiceService = {
      createService: jest.fn(),
      updateService: jest.fn(),
      deleteService: jest.fn(),
      getService: jest.fn(),
      listServices: jest.fn(),
      updateOrCreateService: jest.fn(),
    } as any;

    kongRouteService = {
      createRoute: jest.fn(),
      updateRoute: jest.fn(),
      deleteRoute: jest.fn(),
      getRoute: jest.fn(),
      listRoutes: jest.fn(),
      getPlugins: jest.fn(),
      updateOrCreatePlugin: jest.fn(),
    } as any;

    kongConsumerService = {
      getConsumerAcls: jest.fn(),
      addConsumerAcl: jest.fn(),
      removeConsumerAcl: jest.fn(),
      updateConsumerAcl: jest.fn(),
      updateOrCreateConsumer: jest.fn(),
      deleteConsumerAcl: jest.fn(),
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

    testCreateDto = {
      collectionId: testCollection.id!,
      name: 'Test API',
      enabled: true,
      upstream: {
        url: 'https://upstream.example.com/api',
      },
      downstream: {
        path: '/test-api',
        method: HTTP_METHODS.POST,
        url: '/external/test-api',
      },
      tiers: [1, 2],
      introspectAuthorization: false,
    };

    testUpdateDto = {
      name: 'Updated Test API',
      enabled: false,
      upstream: {
        url: 'https://updated-upstream.example.com/api',
        method: HTTP_METHODS.PUT,
        headers: [{ key: 'X-Update-Header', value: 'update-value' }],
      },
      downstream: {
        path: '/updated-test-api',
        method: HTTP_METHODS.PATCH,
        url: '/external/updated-test-api',
        response: [{ status: 200, data: 'updated' }],
      },
      tiers: [2, 3],
      introspectAuthorization: true,
    };

    // Specialized test entities for assignment/unassignment scenarios
    testCompanyForAssignment = new CompanyBuilder()
      .with('id', 'test-company-assignment-id')
      .with('name', 'Test Company for Assignment')
      .with('tier', '1')
      .build();

    testCompanyForUnassignment = new CompanyBuilder()
      .with('id', 'test-company-unassignment-id')
      .with('name', 'Test Company for Unassignment')
      .with('tier', '2')
      .build();

    testApiRoutesForAssignment = [
      new CollectionRouteBuilder()
        .with('id', 'test-api-assignment-1')
        .with('name', 'Assignment API 1')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
      new CollectionRouteBuilder()
        .with('id', 'test-api-assignment-2')
        .with('name', 'Assignment API 2')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
      new CollectionRouteBuilder()
        .with('id', 'test-api-assignment-3')
        .with('name', 'Assignment API 3')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
    ];

    testApiRoutesForUnassignment = [
      new CollectionRouteBuilder()
        .with('id', 'test-api-unassignment-1')
        .with('name', 'Unassignment API 1')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
      new CollectionRouteBuilder()
        .with('id', 'test-api-unassignment-2')
        .with('name', 'Unassignment API 2')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
      new CollectionRouteBuilder()
        .with('id', 'test-api-unassignment-3')
        .with('name', 'Unassignment API 3')
        .with('environment', KONG_ENVIRONMENT.PRODUCTION)
        .build(),
    ];
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
      
      routeRepository.findAndCount.mockResolvedValue([testRouteArray, 23]);
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      const result = await service.viewAPIs(ctx, TEST_ENVIRONMENT, pagination);

      expect(result.meta).toEqual({
        totalNumberOfRecords: 23,
        totalNumberOfPages: 5,
        pageNumber: 2,
        pageSize: 5,
      });

      expect(routeRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
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

  describe('Create API', () => {
    it('should throw BadRequest error when collectionId does not exist', async () => {
      const createDto = {
        ...testCreateDto,
        collectionId: 'non-existent-collection-id',
        name: 'New API',
      };

      collectionRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAPI(ctx, TEST_ENVIRONMENT, createDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`Collection '${createDto.collectionId}' does not exist`),
        }),
      );

      expect(collectionRepository.findOne).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'equal', _value: createDto.collectionId }) },
      });
      expect(collectionRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when API name is not unique within environment', async () => {
      const createDto = {
        ...testCreateDto,
        name: 'Existing API Name',
        downstream: {
          ...testCreateDto.downstream,
          path: '/existing-api',
          method: HTTP_METHODS.GET,
          url: '/external/existing-api',
        },
        tiers: [1],
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(1);

      await expect(
        service.createAPI(ctx, TEST_ENVIRONMENT, createDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`API name '${createDto.name}' exists`),
        }),
      );

      expect(collectionRepository.findOne).toHaveBeenCalledTimes(1);
      expect(routeRepository.countBy).toHaveBeenCalledWith({
        name: createDto.name,
        environment: TEST_ENVIRONMENT,
      });
      expect(routeRepository.countBy).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when introspectAuthorization is enabled but registry introspection endpoint is not configured', async () => {
      const createDto = {
        ...testCreateDto,
        name: 'Secure API',
        downstream: {
          ...testCreateDto.downstream,
          path: '/secure-api',
          url: '/external/secure-api',
        },
        tiers: [2, 3],
        introspectAuthorization: true,
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      configService.get.mockReturnValue({});

      await expect(
        service.createAPI(ctx, TEST_ENVIRONMENT, createDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Introspection endpoint is not configured'),
        }),
      );

      expect(configService.get).toHaveBeenCalledWith('registry.introspectionEndpoint');
      expect(configService.get).toHaveBeenCalledTimes(1);
    });

    it('should create API with unique routeId and slug when all validations pass', async () => {
      const createDto = {
        ...testCreateDto,
        name: 'Valid New API',
        downstream: {
          ...testCreateDto.downstream,
          response: [{ status: 200, data: 'success' }],
        },
        tiers: [1, 2, 3],
      };

      const createdRoute = {
        ...testRoute,
        id: 'new-route-id',
        name: createDto.name,
        slug: 'valid-new-api',
        enabled: createDto.enabled,
        collectionId: createDto.collectionId,
        tiers: createDto.tiers,
        introspectAuthorization: createDto.introspectAuthorization,
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(createdRoute as any);
      routeRepository.save.mockResolvedValue(createdRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'https://gateway.example.com' });

      const result = await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: 'upstreamexamplecom-api',
        enabled: true,
        url: createDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug],
      });
      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledTimes(1);

      expect(kongRouteService.createRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.stringMatching(/valid-new-api/),
        tags: [testCollection.slug],
        paths: [createDto.downstream.path],
        methods: [createDto.downstream.method],
        service: {
          id: mockCreateGatewayService.id,
        },
      });
      expect(kongRouteService.createRoute).toHaveBeenCalledTimes(1);

      expect(routeRepository.save).toHaveBeenCalledWith(createdRoute);
      expect(routeRepository.save).toHaveBeenCalledTimes(1);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.createdAPI,
          expect.any(GetAPIResponseDTO),
        ),
      );
    });

    it('should create/update upstream service and route in Kong with correct tags and configuration', async () => {
      const createDto = {
        ...testCreateDto,
        name: 'Kong Integration API',
        upstream: {
          ...testCreateDto.upstream,
          url: 'https://backend.service.com/v2/payments',
          method: HTTP_METHODS.PUT,
          headers: [{ key: 'Authorization', value: 'Bearer token123' }],
          querystring: [{ key: 'version', value: 'v2' }],
          body: [{ key: 'metadata', value: 'enabled' }],
        },
        downstream: {
          ...testCreateDto.downstream,
          path: '/payments/process',
          url: '/external/payments',
        },
        tiers: [2, 3],
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(testRoute as any);
      routeRepository.save.mockResolvedValue(testRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'https://gateway.example.com' });

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: 'backendservicecom-v2payments',
        enabled: true,
        url: createDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug],
      });

      expect(kongRouteService.createRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.stringMatching(/kong-integration-api/),
        tags: [testCollection.slug],
        paths: [createDto.downstream.path],
        methods: [createDto.downstream.method],
        service: {
          id: mockCreateGatewayService.id,
        },
      });
    });

    it('should set up ACLs and plugins (ACL, request termination, authorization, request validator, request transformer) as required', async () => {
      const createDto = {
        ...testCreateDto,
        name: 'Full Security API',
        upstream: {
          ...testCreateDto.upstream,
          url: 'https://secure.backend.com/api',
          method: HTTP_METHODS.PATCH,
          headers: [{ key: 'X-API-Key', value: 'secret123' }],
        },
        downstream: {
          ...testCreateDto.downstream,
          path: '/secure/endpoint',
          url: '/external/secure/endpoint',
          request: {
            description: '<table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead><tbody><tr><td>id</td><td>string</td><td>Required User ID</td></tr></tbody></table>',
            body: {
              raw: '{"id": "user123"}'
            }
          },
        },
        tiers: [1, 2, 3],
        introspectAuthorization: true,
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(testRoute as any);
      routeRepository.save.mockResolvedValue(testRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'registry.introspectionEndpoint':
            return { [TEST_ENVIRONMENT]: 'https://registry.example.com/introspect' };
          case 'registry.introspectionClientID':
            return { [TEST_ENVIRONMENT]: 'client123' };
          case 'registry.introspectionClientSecret':
            return { [TEST_ENVIRONMENT]: 'secret456' };
          default:
            return { [TEST_ENVIRONMENT]: 'https://gateway.example.com' };
        }
      });

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        {
          name: 'request-termination',
          enabled: false,
          config: {
            message: 'This API is currently unavailable.',
          },
        },
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'obn-authorization',
          enabled: true,
          config: expect.objectContaining({
            introspection_endpoint: 'https://registry.example.com/introspect',
            client_id: 'client123',
            client_secret: 'secret456',
            scope: [mockGatewayRoute.name],
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'obn-request-validator',
          enabled: true,
          config: expect.objectContaining({
            body: expect.any(Object),
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'request-transformer',
          enabled: true,
          config: expect.objectContaining({
            add: expect.objectContaining({
              headers: expect.arrayContaining(['X-API-Key:secret123']),
            }),
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'acl',
          enabled: true,
          config: expect.objectContaining({
            allow: ['tier-1', 'tier-2', 'tier-3'],
            hide_groups_header: true,
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledTimes(5);
    });

    it('should save API in database with all relevant details', async () => {
      const createDto = {
        ...testCreateDto,
        enabled: false,
        downstream: {
          ...testCreateDto.downstream,
          response: [{ status: 201, message: 'Created' }],
        },
        introspectAuthorization: true,
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(testRoute as any);
      routeRepository.save.mockResolvedValue(testRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(routeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.any(String),
          name: createDto.name,
          slug: mockGatewayRoute.name,
          environment: TEST_ENVIRONMENT,
          introspectAuthorization: createDto.introspectAuthorization,
          serviceId: mockCreateGatewayService.id,
          routeId: mockGatewayRoute.id,
          collectionId: createDto.collectionId,
          enabled: createDto.enabled,
          url: createDto.downstream.url || expect.stringMatching(/https:\/\/gateway\.example\.com/),
          method: createDto.downstream.method,
          response: createDto.downstream.response,
          tiers: createDto.tiers,
        }),
      );
      expect(routeRepository.create).toHaveBeenCalledTimes(1);

      expect(routeRepository.save).toHaveBeenCalledWith(
        expect.any(Object),
      );
      expect(routeRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return created API in standardized DTO format on success', async () => {
      const createDto = testCreateDto;

      const expectedCreatedRoute = {
        ...testRoute,
        name: createDto.name,
        enabled: createDto.enabled,
        collectionId: createDto.collectionId,
        tiers: createDto.tiers,
        introspectAuthorization: createDto.introspectAuthorization,
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(expectedCreatedRoute as any);
      routeRepository.save.mockResolvedValue(expectedCreatedRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'https://gateway.example.com' });

      const result = await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.createdAPI,
          expect.any(GetAPIResponseDTO),
        ),
      );

      const apiDto = result.data;
      expect(apiDto).toEqual(
        expect.objectContaining({
          id: expectedCreatedRoute.id,
          name: expectedCreatedRoute.name,
          slug: expectedCreatedRoute.slug,
          enabled: expectedCreatedRoute.enabled,
          introspectAuthorization: expectedCreatedRoute.introspectAuthorization,
          collectionId: expectedCreatedRoute.collectionId,
          tiers: expectedCreatedRoute.tiers,
          upstream: expect.objectContaining({
            url: expect.stringContaining('https://api.example.com'),
          }),
          downstream: expect.objectContaining({
            path: expect.any(String),
            method: expect.any(String),
          }),
        }),
      );
    });

    it('should emit CreateApiEvent after successful API creation', async () => {
      const createDto = testCreateDto;

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(testRoute as any);
      routeRepository.save.mockResolvedValue(testRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id' } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.create',
        expect.objectContaining({
          name: 'apis.create',
          author: ctx.activeUser,
          metadata: {},
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Update API', () => {
    it('should throw NotFound error when API does not exist for the specified environment', async () => {
      const routeId = 'non-existent-route-id';
      const updateDto = { name: 'Updated API Name', introspectAuthorization: false };

      routeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`API '${routeId}' does not exist`),
        }),
      );

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'equal', _value: routeId }), environment: TEST_ENVIRONMENT },
        relations: { collection: true },
      });
      expect(routeRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when new name is not unique within environment', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        name: 'Existing API Name',
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(1);

      await expect(
        service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`API name '${updateDto.name}' exists`),
        }),
      );

      expect(routeRepository.findOne).toHaveBeenCalledTimes(1);
      expect(routeRepository.countBy).toHaveBeenCalledWith({
        id: expect.objectContaining({ _type: 'not', _value: routeId }),
        environment: TEST_ENVIRONMENT,
        name: updateDto.name,
      });
      expect(routeRepository.countBy).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequest error when introspectAuthorization is toggled but registry introspection endpoint is not configured', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        introspectAuthorization: true,
      };

      const testRouteWithoutAuth = { ...testRoute, introspectAuthorization: false };

      routeRepository.findOne.mockResolvedValue(testRouteWithoutAuth);
      routeRepository.countBy.mockResolvedValue(0);
      configService.get.mockReturnValue({});

      await expect(
        service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Introspection endpoint is not configured'),
        }),
      );

      expect(configService.get).toHaveBeenCalledWith('registry.introspectionEndpoint');
      expect(configService.get).toHaveBeenCalledTimes(1);
    });

    it('should update upstream service and route in Kong when upstream changes are provided', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        name: 'Kong Update API',
        upstream: {
          ...testUpdateDto.upstream,
          url: 'https://new-backend.service.com/v3/payments',
          method: HTTP_METHODS.DELETE,
          headers: [{ key: 'X-Kong-Update', value: 'kong-update-123' }],
        },
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [{ name: 'request-transformer', config: {} }] } as any);
      kongRouteService.updateRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'https://registry.example.com/introspect' });

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: 'new-backendservicecom-v3payments',
        enabled: true,
        url: updateDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug],
      });
      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledTimes(1);

      expect(kongRouteService.updateRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, testRoute.routeId, {
        service: {
          id: mockCreateGatewayService.id,
        },
      });
      expect(kongRouteService.updateRoute).toHaveBeenCalledTimes(2);
    });

    it('should update route in Kong when downstream changes are provided', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        downstream: {
          ...testUpdateDto.downstream,
          path: '/kong/updated-path',
          method: HTTP_METHODS.DELETE,
        },
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [{ name: 'request-transformer', config: {} }] } as any);
      kongRouteService.updateRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(kongRouteService.updateRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, testRoute.routeId, {
        name: expect.stringMatching(/updated-test-api/),
        paths: [updateDto.downstream.path],
        methods: [updateDto.downstream.method],
        service: {
          id: mockGatewayService.id,
        },
      });
      expect(kongRouteService.updateRoute).toHaveBeenCalledTimes(2);
    });

    it('should update plugins (ACL, request termination, authorization, request validator, request transformer) as required', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        enabled: true,
        upstream: {
          ...testUpdateDto.upstream,
          headers: [{ key: 'X-Security-Token', value: 'security123' }],
        },
        downstream: {
          ...testUpdateDto.downstream,
          request: {
            description: '<table><thead><tr><th>Field</th><th>Type</th><th>Required</th></tr></thead><tbody><tr><td>userId</td><td>string</td><td>Yes</td></tr></tbody></table>',
            body: {
              raw: '{"userId": "user456"}'
            }
          },
        },
        introspectAuthorization: true,
        tiers: [1, 2, 3],
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      kongRouteService.getPlugins.mockResolvedValue({ data: [{ name: 'request-transformer', config: {} }] } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case 'registry.introspectionEndpoint':
            return { [TEST_ENVIRONMENT]: 'https://registry.example.com/introspect' };
          case 'registry.introspectionClientID':
            return { [TEST_ENVIRONMENT]: 'client456' };
          case 'registry.introspectionClientSecret':
            return { [TEST_ENVIRONMENT]: 'secret789' };
          default:
            return { [TEST_ENVIRONMENT]: 'https://gateway.example.com' };
        }
      });

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        {
          name: 'request-termination',
          enabled: false,
          config: {
            message: 'This API is currently unavailable.',
          },
        },
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'obn-authorization',
          enabled: true,
          config: expect.objectContaining({
            introspection_endpoint: 'https://registry.example.com/introspect',
            client_id: 'client456',
            client_secret: 'secret789',
            scope: [mockGatewayRoute.name],
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'obn-request-validator',
          enabled: true,
          config: expect.objectContaining({
            body: expect.any(Object),
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'request-transformer',
          enabled: true,
          config: expect.objectContaining({
            add: expect.objectContaining({
              headers: expect.arrayContaining(['X-Security-Token:security123']),
            }),
          }),
        }),
      );

      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        mockGatewayRoute.id,
        expect.objectContaining({
          name: 'acl',
          enabled: true,
          config: expect.objectContaining({
            allow: ['tier-1', 'tier-2', 'tier-3'],
            hide_groups_header: true,
          }),
        }),
      );
    });

    it('should update API in database with all relevant details', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        name: 'Database Update API',
        enabled: true,
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [{ name: 'request-transformer', config: {} }] } as any);
      kongRouteService.updateRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(routeRepository.update).toHaveBeenCalledWith(
        { id: testRoute.id, environment: TEST_ENVIRONMENT },
        expect.objectContaining({
          name: updateDto.name,
          slug: mockGatewayRoute.name,
          introspectAuthorization: updateDto.introspectAuthorization,
          serviceId: mockCreateGatewayService.id,
          routeId: mockGatewayRoute.id,
          enabled: updateDto.enabled,
          url: updateDto.downstream.url,
          method: updateDto.downstream.method,
          request: updateDto.downstream.request,
          response: updateDto.downstream.response,
          tiers: updateDto.tiers,
        }),
      );
      expect(routeRepository.update).toHaveBeenCalledTimes(1);
    });

    it('should return updated API in standardized DTO format on success', async () => {
      const routeId = testRoute.id!;
      const updateDto = testUpdateDto;

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      const result = await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(result).toEqual(
        ResponseFormatter.success(
          apiSuccessMessages.updatedAPI,
          expect.any(GetAPIResponseDTO),
        ),
      );

      const apiDto = result.data;
      expect(apiDto).toHaveProperty('id', testRoute.id);
      expect(apiDto).toHaveProperty('name', updateDto.name);
      expect(apiDto).toHaveProperty('enabled');
      expect(apiDto).toHaveProperty('collectionId', testRoute.collectionId);
      expect(apiDto).toHaveProperty('upstream');
      expect(apiDto).toHaveProperty('downstream');
    });

    it('should emit UpdateApiEvent after successful API update', async () => {
      const routeId = testRoute.id!;
      const updateDto = testUpdateDto;

      routeRepository.findOne.mockResolvedValue(testRoute);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.update.mockResolvedValue({ affected: 1 } as any);
      configService.get.mockReturnValue({ [TEST_ENVIRONMENT]: 'configured' });

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.update',
        expect.objectContaining({
          name: 'apis.update',
          author: ctx.activeUser,
          metadata: {},
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
    });
  });

  describe('Assign APIs to Company', () => {
    const ASSIGNMENT_ENVIRONMENT = KONG_ENVIRONMENT.PRODUCTION;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequest error when company does not exist', async () => {
      const companyId = 'non-existent-company-id';
      const assignDto = { apiIds: ['test-api-1', 'test-api-2'] };

      companyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCompanyApiAccess(ctx, ASSIGNMENT_ENVIRONMENT, companyId, assignDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`No company found with ID - ${companyId}`),
        }),
      );

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'equal', _value: companyId }) },
      });
      expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should only assign APIs not already assigned to the company', async () => {
      const companyId = testCompanyForAssignment.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!, testApiRoutesForAssignment[1].id!, testApiRoutesForAssignment[2].id!] };

      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[0].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `tier-${testCompanyForAssignment.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompanyForAssignment);
      routeRepository.find
        .mockResolvedValueOnce(testApiRoutesForAssignment)
        .mockResolvedValueOnce([testApiRoutesForAssignment[1], testApiRoutesForAssignment[2]]); 
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-id', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'new-acl-id',
        created_at: Date.now(),
      });

      await service.updateCompanyApiAccess(ctx, ASSIGNMENT_ENVIRONMENT, companyId, assignDto);

      expect(routeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({ _type: 'in', _value: assignDto.apiIds }),
          environment: ASSIGNMENT_ENVIRONMENT,
        },
      });

      expect(routeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({ _type: 'in', _value: [testApiRoutesForAssignment[1].id, testApiRoutesForAssignment[2].id] }),
          environment: ASSIGNMENT_ENVIRONMENT,
        },
      });

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompanyForAssignment.tier}`,
        consumerId: 'consumer-id',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[1].id}`,
        consumerId: 'consumer-id',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[2].id}`,
        consumerId: 'consumer-id',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(4);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 
    });

    it('should update Kong consumer ACLs to allow access to assigned APIs', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!, testApiRoutesForAssignment[1].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find
        .mockResolvedValueOnce([testApiRoutesForAssignment[0], testApiRoutesForAssignment[1]]) 
        .mockResolvedValueOnce([testApiRoutesForAssignment[0], testApiRoutesForAssignment[1]]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-123', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: [{ id: 'existing-tier-acl', group: 'tier-1', created_at: Date.now() }],
        offset: undefined,
      } as any);
      kongConsumerService.updateConsumerAcl
        .mockResolvedValueOnce({ id: 'acl-new-1', created_at: Date.now() })
        .mockResolvedValueOnce({ id: 'acl-new-2', created_at: Date.now() });

      await service.updateCompanyApiAccess(ctx, ASSIGNMENT_ENVIRONMENT, companyId, assignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        ASSIGNMENT_ENVIRONMENT,
        'consumer-123',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-123',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[0].id}`,
        consumerId: 'consumer-123',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[1].id}`,
        consumerId: 'consumer-123',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(4); 
    });

    it('should emit AssignApiEvent after successful API assignment', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find
        .mockResolvedValueOnce([testApiRoutesForAssignment[0]]) 
        .mockResolvedValueOnce([testApiRoutesForAssignment[0]]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-event', 
        created_at: Date.now(),
        custom_id: testCompany.id!,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: [], 
        offset: undefined,
      } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'acl-event',
        created_at: Date.now(),
      });

      await service.updateCompanyApiAccess(ctx, ASSIGNMENT_ENVIRONMENT, companyId, assignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        ASSIGNMENT_ENVIRONMENT,
        'consumer-event',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-event',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[0].id}`,
        consumerId: 'consumer-event',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(3); 

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.assign',
        expect.objectContaining({
          name: 'apis.assign',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            apiIds: [testApiRoutesForAssignment[0].id],
            company: testCompany,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.unassign',
        expect.objectContaining({
          name: 'apis.unassign',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            apiIds: [], 
            company: testCompany,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2); 
    });

    it('should return standardized success message on successful assignment', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[2].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find
        .mockResolvedValueOnce([testApiRoutesForAssignment[2]]) 
        .mockResolvedValueOnce([testApiRoutesForAssignment[2]]); 
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-success', 
        created_at: Date.now(),
        custom_id: testCompany.id!,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: [],
        offset: undefined,
      } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'acl-success',
        created_at: Date.now(),
      });

      const result = await service.updateCompanyApiAccess(ctx, ASSIGNMENT_ENVIRONMENT, companyId, assignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        ASSIGNMENT_ENVIRONMENT,
        'consumer-success',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-success',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(ASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `route-${testApiRoutesForAssignment[2].id}`,
        consumerId: 'consumer-success',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(3); 

      expect(result).toEqual(
        ResponseFormatter.success('Successfully updated company API access'),
      );
    });
  });

  describe('Unassign APIs from Company', () => {
    const UNASSIGNMENT_ENVIRONMENT = KONG_ENVIRONMENT.PRODUCTION;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequest error when company does not exist', async () => {
      const companyId = 'non-existent-company-id';
      const unassignDto = { apiIds: ['test-api-1', 'test-api-2'] };

      companyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCompanyApiAccess(ctx, UNASSIGNMENT_ENVIRONMENT, companyId, unassignDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`No company found with ID - ${companyId}`),
        }),
      );

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: expect.objectContaining({ _type: 'equal', _value: companyId }) },
      });
      expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
    });

    it('should only unassign APIs currently assigned to the company', async () => {
      const companyId = testCompanyForUnassignment.id!;
      const unassignDto = { apiIds: [testApiRoutesForUnassignment[2].id!] }; 

      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForUnassignment[0].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `route-${testApiRoutesForUnassignment[1].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompanyForUnassignment.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompanyForUnassignment);
      routeRepository.find.mockResolvedValue(testApiRoutesForUnassignment);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-id', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      kongConsumerService.deleteConsumerAcl.mockResolvedValue(undefined);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'tier-acl-id',
        created_at: Date.now(),
      });

      await service.updateCompanyApiAccess(ctx, UNASSIGNMENT_ENVIRONMENT, companyId, unassignDto);

      expect(routeRepository.find).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({ _type: 'in', _value: unassignDto.apiIds }),
          environment: UNASSIGNMENT_ENVIRONMENT,
        },
      });

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2);

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        UNASSIGNMENT_ENVIRONMENT,
        'consumer-id',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-1', 
        consumerId: companyId, 
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-2', 
        consumerId: companyId, 
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompanyForUnassignment.tier}`, 
        consumerId: 'consumer-id',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(5); 
    });

    it('should update Kong consumer ACLs to remove access from unassigned APIs', async () => {
      const companyId = testCompany.id!;
      const unassignDto = { apiIds: [] }; 

      const existingAcls = [
        { id: 'acl-assigned-1', group: `route-${testApiRoutesForUnassignment[0].id}`, created_at: Date.now() },
        { id: 'acl-assigned-2', group: `route-${testApiRoutesForUnassignment[1].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-unassign', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      kongConsumerService.deleteConsumerAcl.mockResolvedValue(undefined);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'tier-acl-id',
        created_at: Date.now(),
      });

      await service.updateCompanyApiAccess(ctx, UNASSIGNMENT_ENVIRONMENT, companyId, unassignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        UNASSIGNMENT_ENVIRONMENT,
        'consumer-unassign',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-assigned-1',
        consumerId: companyId,
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-assigned-2',
        consumerId: companyId,
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledTimes(2);

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-unassign',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(2); 
    });

    it('should emit UnassignApiEvent after successful API unassignment', async () => {
      const companyId = testCompany.id!;
      const unassignDto = { apiIds: [] }; 

      const existingAcls = [
        { id: 'acl-unassign-event', group: `route-${testApiRoutesForUnassignment[0].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-unassign-event', 
        created_at: Date.now(),
        custom_id: testCompany.id!,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      kongConsumerService.deleteConsumerAcl.mockResolvedValue(undefined);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'tier-acl-id',
        created_at: Date.now(),
      });

      await service.updateCompanyApiAccess(ctx, UNASSIGNMENT_ENVIRONMENT, companyId, unassignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        UNASSIGNMENT_ENVIRONMENT,
        'consumer-unassign-event',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      // Should delete the API ACL
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-unassign-event',
        consumerId: companyId, 
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledTimes(1);

      
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-unassign-event',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(2); 

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.assign',
        expect.objectContaining({
          name: 'apis.assign',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            apiIds: [], 
            company: testCompany,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.unassign',
        expect.objectContaining({
          name: 'apis.unassign',
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            apiIds: [testApiRoutesForUnassignment[0].id], 
            company: testCompany,
          }),
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(2); 
    });

    it('should return standardized success message on successful unassignment', async () => {
      const companyId = testCompany.id!;
      const unassignDto = { apiIds: [] }; 

      const existingAcls = [
        { id: 'acl-unassign-success', group: `route-${testApiRoutesForUnassignment[1].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-unassign-success', 
        created_at: Date.now(),
        custom_id: testCompany.id!,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      kongConsumerService.deleteConsumerAcl.mockResolvedValue(undefined);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'tier-acl-id',
        created_at: Date.now(),
      });

      const result = await service.updateCompanyApiAccess(ctx, UNASSIGNMENT_ENVIRONMENT, companyId, unassignDto);

      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        custom_id: companyId,
      });
      expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledTimes(2); 

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        UNASSIGNMENT_ENVIRONMENT,
        'consumer-unassign-success',
        undefined,
      );
      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclId: 'acl-unassign-success',
        consumerId: companyId,
      });
      expect(kongConsumerService.deleteConsumerAcl).toHaveBeenCalledTimes(1);

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(UNASSIGNMENT_ENVIRONMENT, {
        aclAllowedGroupName: `tier-${testCompany.tier}`, 
        consumerId: 'consumer-unassign-success',
      });
      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(2); 

      expect(result).toEqual(
        ResponseFormatter.success('Successfully updated company API access'),
      );
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
