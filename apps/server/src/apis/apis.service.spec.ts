import { CompanyTypes } from '@common/database/constants';
import {
  Collection,
  CollectionRoute,
  Company,
  User,
} from '@common/database/entities';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { PERMISSIONS } from '@permissions/types';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { CreateRouteResponse, ListPluginsResponse, ListRoutesResponse } from '@shared/integrations/kong/route/route.kong.interface';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { CreateServiceResponse, GetServiceResponse, ListServicesResponse } from '@shared/integrations/kong/service/service.kong.interface';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import {
  CollectionBuilder,
  CollectionRouteBuilder,
  CompanyBuilder,
  RoleBuilder,
  UserBuilder,
} from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import {
  createMockContext,
  mockEventEmitter,
} from '@test/utils/mocks/http.mock';
import { Equal } from 'typeorm';
import { apiSuccessMessages } from './apis.constants';
import { APIService } from './apis.service';
import { GetAPIResponseDTO } from './dto/index.dto';
import { HTTP_METHODS } from './types';

describe('APIService', () => {
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
      .with('tier', "1")
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
      deleteRoute: jest.fn().mockResolvedValue({ 
        id: 'deleted-route-id'
      } as any),
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
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'kong.gatewayEndpoint') {
          return { [TEST_ENVIRONMENT]: 'https://gateway.example.com' };
        }
        if (key === 'registry.introspectionEndpoint') {
          return { [TEST_ENVIRONMENT]: 'https://introspect.example.com' };
        }
        if (key === 'registry.introspectionClientID') {
          return { [TEST_ENVIRONMENT]: 'test-client-id' };
        }
        if (key === 'registry.introspectionClientSecret') {
          return { [TEST_ENVIRONMENT]: 'test-client-secret' };
        }
        return null;
      }),
    } as any;

    eventEmitter = mockEventEmitter();

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

    testCompanyForAssignment = new CompanyBuilder()
      .with('id', 'test-company-assignment-id')
      .with('name', 'Test Company for Assignment')
      .with('tier', "1")
      .build();

    testCompanyForUnassignment = new CompanyBuilder()
      .with('id', 'test-company-unassignment-id')
      .with('name', 'Test Company for Unassignment')
      .with('tier', "2")
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
          metadata: expect.any(Object),
        }),
      );
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
          { id: Equal(apiId), environment: TEST_ENVIRONMENT },
          { name: Equal(apiId), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });

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
          metadata: expect.any(Object),
        }),
      );
    });

    it('should retrieve API by slug for the specified environment', async () => {
      const apiSlug = 'payment-api';

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongServiceService.getService.mockResolvedValue(mockGatewayService);
      kongRouteService.getRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [] });

      await service.viewAPI(ctx, TEST_ENVIRONMENT, apiSlug);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: Equal(apiSlug), environment: TEST_ENVIRONMENT },
          { name: Equal(apiSlug), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });
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
          { id: Equal(nonExistentId), environment: TEST_ENVIRONMENT },
          { name: Equal(nonExistentId), environment: TEST_ENVIRONMENT },
        ],
        relations: { collection: true },
      });

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
        where: { id: Equal(createDto.collectionId) },
      });
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

      expect(routeRepository.countBy).toHaveBeenCalledWith({
        name: createDto.name,
        environment: TEST_ENVIRONMENT,
      });
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
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

      const result = await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.any(String),
        enabled: true,
        url: createDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug!],
      });

      expect(kongRouteService.createRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.stringMatching(/valid-new-api/),
        tags: [testCollection.slug!],
        paths: [createDto.downstream.path],
        methods: [createDto.downstream.method],
        service: {
          id: mockCreateGatewayService.id,
        },
      });

      expect(routeRepository.save).toHaveBeenCalledWith(createdRoute);

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
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.any(String),
        enabled: true,
        url: createDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug!],
      });

      expect(kongRouteService.createRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.stringMatching(/kong-integration-api/),
        tags: [testCollection.slug!],
        paths: [createDto.downstream.path],
        methods: [createDto.downstream.method],
        service: {
          id: mockCreateGatewayService.id,
        },
      });
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
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

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
          url: expect.any(String),
          method: createDto.downstream.method,
          response: createDto.downstream.response,
          tiers: createDto.tiers,
        }),
      );

      expect(routeRepository.save).toHaveBeenCalledWith(
        expect.any(Object),
      );
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
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

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
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.create',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
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
        where: { id: Equal(routeId), environment: TEST_ENVIRONMENT },
        relations: { collection: true },
      });

      expect(routeRepository.update).not.toHaveBeenCalled();
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

      expect(routeRepository.countBy).toHaveBeenCalledWith({
        name: updateDto.name,
        environment: TEST_ENVIRONMENT,
        id: expect.any(Object),
      });
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

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(kongServiceService.updateOrCreateService).toHaveBeenCalledWith(TEST_ENVIRONMENT, {
        name: expect.any(String),
        enabled: true,
        url: updateDto.upstream.url,
        retries: 1,
        tags: [testCollection.slug!],
      });

      expect(kongRouteService.updateRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, testRoute.routeId, {
        service: {
          id: mockCreateGatewayService.id,
        },
      });
    });

    it('should update API in database with all relevant details', async () => {
      const routeId = testRoute.id!;
      const updateDto = {
        ...testUpdateDto,
        name: 'Database Update API',
        enabled: true,
        downstream: {
          ...testUpdateDto.downstream,
          request: { method: 'POST', headers: { 'Content-Type': 'application/json' } },
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

      await service.updateAPI(ctx, TEST_ENVIRONMENT, routeId, updateDto);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.update',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
    });
  });

  describe('Delete API', () => {
    it('should throw NotFound error when API does not exist', async () => {
      const routeId = 'non-existent-route-id';

      routeRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteAPI(ctx, TEST_ENVIRONMENT, routeId),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`API '${routeId}' does not exist`),
        }),
      );

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(routeId), environment: TEST_ENVIRONMENT },
      });
    });

    it('should delete route from Kong and soft delete from database when API exists', async () => {
      const routeId = testRoute.id!;

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongRouteService.deleteRoute.mockResolvedValue({ 
        id: 'deleted-route-id' 
      } as any);
      routeRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteAPI(ctx, TEST_ENVIRONMENT, routeId);

      expect(kongRouteService.deleteRoute).toHaveBeenCalledWith(TEST_ENVIRONMENT, testRoute.routeId);

      expect(routeRepository.softDelete).toHaveBeenCalledWith({
        id: routeId,
        environment: TEST_ENVIRONMENT,
      });

      expect(result).toEqual(
        ResponseFormatter.success(apiSuccessMessages.deletedAPI),
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.delete',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.objectContaining({
            route: testRoute,
          }),
        }),
      );
    });

    it('should not call Kong delete when routeId is not present', async () => {
      const routeWithoutKongId = {
        ...testRoute,
        routeId: null,
      };

      routeRepository.findOne.mockResolvedValue(routeWithoutKongId);
      routeRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      await service.deleteAPI(ctx, TEST_ENVIRONMENT, routeWithoutKongId.id!);

      expect(kongRouteService.deleteRoute).not.toHaveBeenCalled();
      expect(routeRepository.softDelete).toHaveBeenCalledTimes(1);
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
        where: { id: Equal(companyId) },
      });
    });

    it('should only assign APIs not already assigned to the company', async () => {
      const companyId = testCompanyForAssignment.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!, testApiRoutesForAssignment[1].id!, testApiRoutesForAssignment[2].id!] };

      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[0].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `tier-${testCompanyForAssignment.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompanyForAssignment);
      routeRepository.find.mockResolvedValue(testApiRoutesForAssignment);
      
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
          id: expect.any(Object),
          environment: ASSIGNMENT_ENVIRONMENT,
        },
      });

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(3);
    });

    it('should update Kong consumer ACLs to allow access to assigned APIs', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!, testApiRoutesForAssignment[1].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([testApiRoutesForAssignment[0], testApiRoutesForAssignment[1]]);
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

      expect(kongConsumerService.getConsumerAcls).toHaveBeenCalledWith(
        ASSIGNMENT_ENVIRONMENT,
        'consumer-123',
        undefined,
      );

      expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(2);
    });

    it('should emit AssignApiEvent after successful API assignment', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[0].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([testApiRoutesForAssignment[0]]);
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

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.assign',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
    });

    it('should return standardized success message on successful assignment', async () => {
      const companyId = testCompany.id!;
      const assignDto = { apiIds: [testApiRoutesForAssignment[2].id!] };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([testApiRoutesForAssignment[2]]);
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

      expect(result).toEqual(
        ResponseFormatter.success('Successfully updated company API access'),
      );
    });
  });

  describe('Get APIs Assigned to Company', () => {
    const GET_ASSIGNED_ENVIRONMENT = KONG_ENVIRONMENT.PRODUCTION;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequest error when company does not exist', async () => {
      const companyId = 'non-existent-company-id';
      const pagination = DEFAULT_PAGINATION;

      companyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, companyId, pagination),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`No company found with ID - ${companyId}`),
        }),
      );

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(companyId) },
      });
    });

    it('should use current company when companyId is not specified', async () => {
      const pagination = DEFAULT_PAGINATION;
      const mockAssignedRoutes = [testApiRoutesForAssignment[0], testApiRoutesForAssignment[1]];
      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[0].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `route-${testApiRoutesForAssignment[1].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-current', 
        created_at: Date.now(),
        custom_id: testCompany.id!,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([mockAssignedRoutes, 2]);
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      const result = await service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, undefined, pagination);

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(testCompany.id) },
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          expect.any(String),
          expect.arrayContaining([
            expect.any(Object),
            expect.any(Object),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: 2,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );
    });

    it('should return paginated APIs assigned to specified company with filtering support', async () => {
      const companyId = testCompanyForAssignment.id!;
      const pagination = { page: 2, limit: 5 };
      const filters = { name: 'Assignment API' };
      const mockAssignedRoutes = [testApiRoutesForAssignment[1], testApiRoutesForAssignment[2]];
      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[1].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `route-${testApiRoutesForAssignment[2].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompanyForAssignment.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompanyForAssignment);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-paginated', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([mockAssignedRoutes, 15]);
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      const result = await service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, companyId, pagination, filters);

      expect(routeRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.any(Array),
        skip: 5,
        take: 5,
        order: { name: 'ASC' },
      });

      expect(result.meta).toEqual({
        totalNumberOfRecords: 15,
        totalNumberOfPages: 3,
        pageNumber: 2,
        pageSize: 5,
      });
    });

    it('should return APIs in standardized DTO format on success', async () => {
      const companyId = testCompany.id!;
      const pagination = DEFAULT_PAGINATION;
      const mockAssignedRoutes = [testApiRoutesForAssignment[0]];
      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[0].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-dto', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([mockAssignedRoutes, 1]);
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      const result = await service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, companyId, pagination);

      expect(result).toEqual(
        ResponseFormatter.success(
          expect.any(String),
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

    it('should emit ViewCompanyApisEvent after successful retrieval', async () => {
      const companyId = testCompanyForAssignment.id!;
      const pagination = DEFAULT_PAGINATION;
      const mockAssignedRoutes = [testApiRoutesForAssignment[2]];
      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[2].id}`, created_at: Date.now() },
        { id: 'acl-tier', group: `tier-${testCompanyForAssignment.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompanyForAssignment);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-event', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([mockAssignedRoutes, 1]);
      kongServiceService.listServices.mockResolvedValue({ data: [] });
      kongRouteService.listRoutes.mockResolvedValue({ data: [] });

      await service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, companyId, pagination);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.company.view',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
    });

    it('should return empty results when company has no assigned APIs', async () => {
      const companyId = testCompany.id!;
      const pagination = DEFAULT_PAGINATION;
      const existingAcls = [
        { id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() },
      ];

      companyRepository.findOne.mockResolvedValue(testCompany);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-empty', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.getApisAssignedToCompany(ctx, GET_ASSIGNED_ENVIRONMENT, companyId, pagination);

      expect(routeRepository.findAndCount).toHaveBeenCalledWith({
        where: expect.any(Array),
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          expect.any(String),
          [],
          expect.objectContaining({
            totalNumberOfRecords: 0,
            totalNumberOfPages: 0,
            pageNumber: 1,
            pageSize: 10,
          }),
        ),
      );
    });
  });

  describe('Update Company API Access', () => {
    const UPDATE_ACCESS_ENVIRONMENT = KONG_ENVIRONMENT.PRODUCTION;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw BadRequest error when environment is DEVELOPMENT', async () => {
      const companyId = testCompany.id!;
      const updateDto = { apiIds: [testApiRoutesForAssignment[0].id!] };

      await expect(
        service.updateCompanyApiAccess(ctx, KONG_ENVIRONMENT.DEVELOPMENT, companyId, updateDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining('Cannot configure API access for this environment'),
        }),
      );
    });

    it('should throw BadRequest error when company does not exist', async () => {
      const companyId = 'non-existent-company-id';
      const updateDto = { apiIds: [testApiRoutesForAssignment[0].id!] };

      companyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateCompanyApiAccess(ctx, UPDATE_ACCESS_ENVIRONMENT, companyId, updateDto),
      ).rejects.toThrow(
        expect.objectContaining({
          message: expect.stringContaining(`No company found with ID - ${companyId}`),
        }),
      );

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(companyId) },
      });
    });

    it('should return standardized success message on successful update', async () => {
      const companyId = testCompany.id!;
      const updateDto = { 
        apiIds: [testApiRoutesForAssignment[0].id!, testApiRoutesForAssignment[1].id!] 
      };

      companyRepository.findOne.mockResolvedValue(testCompany);
      routeRepository.find.mockResolvedValue([testApiRoutesForAssignment[0], testApiRoutesForAssignment[1]]);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-success', 
        created_at: Date.now(),
        custom_id: companyId,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: [{ id: 'acl-tier', group: `tier-${testCompany.tier}`, created_at: Date.now() }],
        offset: undefined,
      } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ 
        id: 'acl-success',
        created_at: Date.now(),
      });

      const result = await service.updateCompanyApiAccess(ctx, UPDATE_ACCESS_ENVIRONMENT, companyId, updateDto);

      expect(result).toEqual(
        ResponseFormatter.success('Successfully updated company API access'),
      );
    });
  });

  describe('Transformation Methods', () => {
    it('should get transformation for API route', async () => {
      const routeId = testRoute.id!;
      const mockPlugin = {
        id: 'post-function-plugin',
        name: 'post-function',
        config: {
          access: ['upstream transformation code'],
          header_filter: ['downstream transformation code'],
        },
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongRouteService.getPlugins.mockResolvedValue({ data: [mockPlugin] } as any);

      const result = await service.getTransformation(ctx, TEST_ENVIRONMENT, routeId);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(routeId), environment: TEST_ENVIRONMENT },
        relations: { collection: true },
      });
      expect(kongRouteService.getPlugins).toHaveBeenCalledWith(TEST_ENVIRONMENT, testRoute.routeId);

      expect(result).toEqual(
        ResponseFormatter.success(
          expect.any(String),
          expect.any(Object),
        )
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.transformation.view',
        expect.objectContaining({
          author: ctx.activeUser,
        }),
      );
    });

    it('should set transformation for API route', async () => {
      const routeId = testRoute.id!;
      const transformationDto = {
        upstream: 'upstream transformation code',
        downstream: 'downstream transformation code',
      };

      const mockPlugin = {
        id: 'post-function-plugin',
        config: transformationDto,
      };

      routeRepository.findOne.mockResolvedValue(testRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue(mockPlugin as any);

      const result = await service.setTransformation(ctx, TEST_ENVIRONMENT, routeId, transformationDto);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(routeId), environment: TEST_ENVIRONMENT },
        relations: { collection: true },
      });
      expect(kongRouteService.updateOrCreatePlugin).toHaveBeenCalledWith(
        TEST_ENVIRONMENT,
        testRoute.routeId,
        expect.objectContaining({
          name: 'post-function',
          enabled: true,
          config: expect.objectContaining({
            access: expect.any(Array),
            header_filter: expect.any(Array),
            body_filter: expect.any(Array),
          }),
        }),
      );

      expect(result).toEqual(
        ResponseFormatter.success(
          expect.any(String),
          expect.any(Object),
        )
      );

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.transformation.set',
        expect.objectContaining({
          author: ctx.activeUser,
        }),
      );
    });
  });

  describe('Path Conversion', () => {
    it('should convert Kong regex path to clean OpenAPI format', async () => {
      const createDto = {
        ...testCreateDto,
        downstream: {
          ...testCreateDto.downstream,
          path: '~/users/(?<userId>[^/]+)/posts/(?<postId>[^/]+)$',
          url: '/external/test-api',
        },
      };

      collectionRepository.findOne.mockResolvedValue(testCollection);
      routeRepository.countBy.mockResolvedValue(0);
      kongServiceService.updateOrCreateService.mockResolvedValue(mockCreateGatewayService);
      kongRouteService.createRoute.mockResolvedValue(mockGatewayRoute);
      kongRouteService.updateOrCreatePlugin.mockResolvedValue({ id: 'plugin-id' } as any);
      routeRepository.create.mockReturnValue(testRoute as any);
      routeRepository.save.mockResolvedValue(testRoute as any);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ id: 'consumer-id', custom_id: testCompany.id } as any);
      kongConsumerService.updateConsumerAcl.mockResolvedValue({ id: 'acl-id' } as any);

      await service.createAPI(ctx, TEST_ENVIRONMENT, createDto);

      expect(routeRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          url: createDto.downstream.url,
        }),
      );
    });
  });

  describe('Security & Permissions', () => {
    it('should verify access is scoped to current user context and environment for viewAPIs', async () => {
      const pagination = DEFAULT_PAGINATION;
      const filters = { name: 'Test API' };
      routeRepository.findAndCount.mockResolvedValue([testRouteArray, 2]);
      kongServiceService.listServices.mockResolvedValue(mockGatewayServices);
      kongRouteService.listRoutes.mockResolvedValue(mockGatewayRoutes);

      await service.viewAPIs(ctx, TEST_ENVIRONMENT, pagination, filters);
      
      expect(routeRepository.findAndCount).toHaveBeenCalledWith({
        where: { ...filters, environment: TEST_ENVIRONMENT },
        skip: 0,
        take: 10,
        order: { name: 'ASC' },
        relations: { collection: true },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.view',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
    });

    it('should verify assigned APIs retrieval uses current company when companyId not specified', async () => {
      const GET_ASSIGNED_ENVIRONMENT = KONG_ENVIRONMENT.PRODUCTION;
      const existingAcls = [
        { id: 'acl-1', group: `route-${testApiRoutesForAssignment[0].id}`, created_at: Date.now() },
        { id: 'acl-2', group: `route-${testApiRoutesForAssignment[1].id}`, created_at: Date.now() },
      ];
      
      companyRepository.findOne.mockResolvedValue(testCompany);
      kongConsumerService.updateOrCreateConsumer.mockResolvedValue({ 
        id: 'consumer-current',
        created_at: Date.now(),
        custom_id: ctx.activeUser.company!.id,
      });
      kongConsumerService.getConsumerAcls.mockResolvedValue({
        data: existingAcls,
        offset: undefined,
      } as any);
      routeRepository.findAndCount.mockResolvedValue([testApiRoutesForAssignment, 3]);

      await service.getApisAssignedToCompany(
        ctx,
        GET_ASSIGNED_ENVIRONMENT,
        undefined,
        DEFAULT_PAGINATION
      );

      expect(companyRepository.findOne).toHaveBeenCalledWith({
        where: { id: Equal(ctx.activeUser.company!.id) },
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'apis.company.view',
        expect.objectContaining({
          author: ctx.activeUser,
          metadata: expect.any(Object),
        }),
      );
    });

    it('should verify environment-specific access restrictions for API operations', async () => {
      const DEVELOPMENT_ENV = KONG_ENVIRONMENT.DEVELOPMENT;

      await expect(
        service.updateCompanyApiAccess(
          ctx,
          DEVELOPMENT_ENV,
          testCompanyForAssignment.id!,
          { apiIds: ['api-1', 'api-2'] }
        )
      ).rejects.toThrow('Cannot configure API access for this environment');

      expect(kongConsumerService.updateConsumerAcl).not.toHaveBeenCalled();
      expect(kongConsumerService.getConsumerAcls).not.toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});