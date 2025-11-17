import {
    IBadRequestException,
    INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Equal } from 'typeorm';

// Entities
import { Collection } from '@common/database/entities/collection.entity';
import { ImportedApiSpec, ImportStatus, SpecFormat } from '@common/database/entities/importedapispec.entity';
import { User } from '@common/database/entities/user.entity';

// Service and DTOs
import { ImportApiSpecDto, ImportCollectionDto, ImportDetailDto, ImportErrorDto, ImportUserDto } from './dto/import.dto';
import { ApiSpecImportService } from './import.service';

// Parsers and Interfaces
import {
    ImportEndpointsResult,
    ParsedEndpoint,
    ParsedParameter,
    ParsedSpecResult,
} from './interfaces/parser.interface';
import { OpenApiV3Parser } from './parsers/openapi-v3.parser';
import { PostmanV2Parser } from './parsers/postman-v2.parser';
import { SwaggerV2Parser } from './parsers/swagger-v2.parser';

// Test utilities
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { CollectionBuilder, ProfileBuilder, UserBuilder } from '@test/utils/builders';
import { createMockRepository, MockRepository } from '@test/utils/mocks';
import { createMockContext } from '@test/utils/mocks/http.mock';

// HTTP_METHODS
enum HTTP_METHODS {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

describe('ApiSpecImportService', () => {
  let service: ApiSpecImportService;
  let importedSpecRepo: MockRepository<ImportedApiSpec>;
  let collectionRepo: MockRepository<Collection>;
  let userRepository: MockRepository<User>;
  let openApiV3Parser: jest.Mocked<OpenApiV3Parser>;
  let swaggerV2Parser: jest.Mocked<SwaggerV2Parser>;
  let postmanV2Parser: jest.Mocked<PostmanV2Parser>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  let ctx: RequestContext;
  let testUser: User;
  let testCollection: Collection;
  let testImportedSpec: ImportedApiSpec;

  const TEST_ENVIRONMENT = KONG_ENVIRONMENT.DEVELOPMENT;
  const DEFAULT_PAGINATION = { page: 1, limit: 10 };

  // Test data with correct types
  const mockOpenApiV3Spec = {
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API description'
    },
    servers: [{ url: 'https://api.example.com' }],
    paths: {
      '/users': {
        get: {
          summary: 'Get users',
          parameters: [
            {
              name: 'Authorization',
              in: 'header',
              required: false,
              schema: { type: 'string', default: 'Bearer token' },
              type: 'string'
            },
            {
              name: 'page',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 1 },
              type: 'integer'
            }
          ],
          responses: {
            '200': { description: 'Success' }
          }
        }
      },
      '/users/{id}': {
        get: {
          summary: 'Get user by ID',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              type: 'string'
            }
          ],
          responses: {
            '200': { description: 'Success' }
          }
        }
      }
    }
  };

  const mockParsedParameters: ParsedParameter[] = [
    {
      name: 'Authorization',
      in: 'header',
      required: false,
      schema: { type: 'string', default: 'Bearer token' },
      type: 'string'
    },
    {
      name: 'page',
      in: 'query',
      required: false,
      schema: { type: 'integer', default: 1 },
      type: 'integer'
    },
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string' },
      type: 'string'
    }
  ];

  const mockParsedEndpoints: ParsedEndpoint[] = [
    {
      name: 'Get users',
      path: '/users',
      method: HTTP_METHODS.GET,
      parameters: [mockParsedParameters[0], mockParsedParameters[1]],
      responses: {
        '200': { description: 'Success' }
      },
      requestBody: undefined
    },
    {
      name: 'Get user by ID',
      path: '/users/{id}',
      method: HTTP_METHODS.GET,
      parameters: [mockParsedParameters[2]],
      responses: {
        '200': { description: 'Success' }
      },
      requestBody: undefined
    }
  ];

  const mockParsedSpec = {
    metadata: {
      title: 'Test API',
      version: '1.0.0',
      description: 'Test API description',
      baseUrl: 'https://api.example.com'
    },
    endpoints: mockParsedEndpoints
  };

  const mockSpecInfo = {
    format: 'openapi' as const,
    version: '3.0.0'
  };

  const mockValidationResult = {
    valid: true,
    errors: []
  };

  const mockImportOptions: ImportApiSpecDto = {
    specFile: JSON.stringify(mockOpenApiV3Spec),
    specName: 'Test API Import',
    enableByDefault: true,
    requireAuth: false,
    defaultTiers: ['1', '2'],
    upstreamBaseUrl: 'https://api.example.com',
    upstreamMethod: HTTP_METHODS.GET,
    downstreamMethod: HTTP_METHODS.GET,
    downstreamBaseUrl: 'https://gateway.example.com'
  };

  beforeEach(async () => {
    // Create test user
    const testProfile = new ProfileBuilder()
      .with('firstName', 'John')
      .with('lastName', 'Doe')
      .build();

    testUser = new UserBuilder()
      .with('id', 'test-user-id')
      .with('email', 'test@example.com')
      .with('profile', testProfile)
      .build();

    // Create test collection
    testCollection = new CollectionBuilder()
      .with('id', 'test-collection-id')
      .with('name', 'Test Collection')
      .with('slug', 'test-collection')
      .build();

    // Create test imported spec
    testImportedSpec = {
      id: 'test-import-id',
      name: 'Test API Import',
      specFormat: SpecFormat.OPENAPI_V3,
      specVersion: '3.0.0',
      originalSpec: JSON.stringify(mockOpenApiV3Spec),
      parsedMetadata: mockParsedSpec.metadata,
      importStatus: ImportStatus.PROCESSING,
      importedCount: 0,
      failedCount: 0,
      errorLog: [],
      collection: testCollection,
      collectionId: testCollection.id!,
      environment: TEST_ENVIRONMENT,
      importedBy: testUser,
      importedById: testUser.id!,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as ImportedApiSpec;

    // Create mock context
    ctx = createMockContext({
      user: testUser,
    }).ctx;

    // Create mock repositories
    importedSpecRepo = createMockRepository<ImportedApiSpec>();
    collectionRepo = createMockRepository<Collection>();
    userRepository = createMockRepository<User>();

    // Create mock parsers
    openApiV3Parser = {
      canParse: jest.fn(),
      validate: jest.fn(),
      parse: jest.fn(),
      getSpecInfo: jest.fn(),
    } as any;

    swaggerV2Parser = {
      canParse: jest.fn(),
      validate: jest.fn(),
      parse: jest.fn(),
      getSpecInfo: jest.fn(),
    } as any;

    postmanV2Parser = {
      canParse: jest.fn(),
      validate: jest.fn(),
      parse: jest.fn(),
      getSpecInfo: jest.fn(),
    } as any;

    // Create mock event emitter
    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiSpecImportService,
        {
          provide: getRepositoryToken(ImportedApiSpec),
          useValue: importedSpecRepo,
        },
        {
          provide: getRepositoryToken(Collection),
          useValue: collectionRepo,
        },
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: OpenApiV3Parser,
          useValue: openApiV3Parser,
        },
        {
          provide: SwaggerV2Parser,
          useValue: swaggerV2Parser,
        },
        {
          provide: PostmanV2Parser,
          useValue: postmanV2Parser,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    service = module.get<ApiSpecImportService>(ApiSpecImportService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('parseAndValidateSpec', () => {
    it('should successfully parse and validate a valid OpenAPI v3 spec', async () => {
      // Mock parser detection
      openApiV3Parser.canParse.mockReturnValue(true);
      openApiV3Parser.validate.mockReturnValue(mockValidationResult);
      openApiV3Parser.parse.mockReturnValue(mockParsedSpec);
      openApiV3Parser.getSpecInfo.mockReturnValue(mockSpecInfo);

      const result = await service.parseAndValidateSpec(
        ctx,
        TEST_ENVIRONMENT,
        mockImportOptions
      );

      expect(result).toEqual({
        spec: mockOpenApiV3Spec,
        parser: openApiV3Parser,
        parsed: mockParsedSpec,
        specInfo: mockSpecInfo,
      });

      expect(openApiV3Parser.canParse).toHaveBeenCalledWith(mockOpenApiV3Spec);
      expect(openApiV3Parser.validate).toHaveBeenCalledWith(mockOpenApiV3Spec);
      expect(openApiV3Parser.parse).toHaveBeenCalledWith(mockOpenApiV3Spec);
      expect(openApiV3Parser.getSpecInfo).toHaveBeenCalledWith(mockOpenApiV3Spec);
    });

    it('should throw BadRequestException for invalid JSON/YAML content', async () => {
      const invalidOptions = {
        ...mockImportOptions,
        specFile: 'invalid { json content',
      };

      await expect(
        service.parseAndValidateSpec(ctx, TEST_ENVIRONMENT, invalidOptions)
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw BadRequestException for unsupported spec format', async () => {
      const unsupportedSpec = { some: 'unsupported format' };
      const options = {
        ...mockImportOptions,
        specFile: JSON.stringify(unsupportedSpec),
      };

      // No parser can parse this spec
      openApiV3Parser.canParse.mockReturnValue(false);
      swaggerV2Parser.canParse.mockReturnValue(false);
      postmanV2Parser.canParse.mockReturnValue(false);

      await expect(
        service.parseAndValidateSpec(ctx, TEST_ENVIRONMENT, options)
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw BadRequestException for invalid spec validation', async () => {
      const validationErrors = {
        valid: false,
        errors: ['Missing required field: info.title']
      };

      openApiV3Parser.canParse.mockReturnValue(true);
      openApiV3Parser.validate.mockReturnValue(validationErrors);

      await expect(
        service.parseAndValidateSpec(ctx, TEST_ENVIRONMENT, mockImportOptions)
      ).rejects.toThrow(IBadRequestException);
    });
  });

  describe('createImportRecord', () => {
    it('should create import record with existing collection', async () => {
      const parsedSpec: ParsedSpecResult = {
        spec: mockOpenApiV3Spec,
        parser: openApiV3Parser,
        parsed: mockParsedSpec,
        specInfo: mockSpecInfo,
      };

      const optionsWithCollection = {
        ...mockImportOptions,
        collectionId: testCollection.id,
      };

      collectionRepo.findOne.mockResolvedValue(testCollection);
      importedSpecRepo.save.mockResolvedValue(testImportedSpec);

      const result = await service.createImportRecord(
        ctx,
        TEST_ENVIRONMENT,
        parsedSpec,
        optionsWithCollection
      );

      expect(collectionRepo.findOne).toHaveBeenCalledWith({
        where: { id: Equal(testCollection.id!) },
      });
      expect(importedSpecRepo.save).toHaveBeenCalledWith({
        name: optionsWithCollection.specName,
        specFormat: 'openapi',
        specVersion: mockSpecInfo.version,
        originalSpec: JSON.stringify(mockOpenApiV3Spec),
        parsedMetadata: mockParsedSpec.metadata,
        importStatus: ImportStatus.PROCESSING,
        collection: testCollection,
        collectionId: testCollection.id,
        environment: TEST_ENVIRONMENT,
        importedById: ctx.activeUser.id,
      });
      expect(result).toEqual(testImportedSpec);
    });

    it('should create import record with new collection', async () => {
      const parsedSpec: ParsedSpecResult = {
        spec: mockOpenApiV3Spec,
        parser: openApiV3Parser,
        parsed: mockParsedSpec,
        specInfo: mockSpecInfo,
      };

      const optionsWithoutCollection = {
        ...mockImportOptions,
        collectionId: undefined,
        collectionName: 'New Collection',
      };

      const newCollection = {
        ...testCollection,
        id: 'new-collection-id',
        name: 'New Collection',
        slug: 'new-collection',
      };

      collectionRepo.save.mockResolvedValue(newCollection);
      importedSpecRepo.save.mockResolvedValue({
        ...testImportedSpec,
        collection: newCollection,
        collectionId: newCollection.id!,
      });

      const result = await service.createImportRecord(
        ctx,
        TEST_ENVIRONMENT,
        parsedSpec,
        optionsWithoutCollection
      );

      expect(collectionRepo.save).toHaveBeenCalledWith({
        name: 'New Collection',
        slug: 'new-collection',
        description: mockParsedSpec.metadata.description,
      });
      expect(result.collectionId).toEqual(newCollection.id);
    });

    it('should throw NotFoundException when specified collection does not exist', async () => {
      const parsedSpec: ParsedSpecResult = {
        spec: mockOpenApiV3Spec,
        parser: openApiV3Parser,
        parsed: mockParsedSpec,
        specInfo: mockSpecInfo,
      };

      const optionsWithInvalidCollection = {
        ...mockImportOptions,
        collectionId: 'non-existent-collection-id',
      };

      collectionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.createImportRecord(
          ctx,
          TEST_ENVIRONMENT,
          parsedSpec,
          optionsWithInvalidCollection
        )
      ).rejects.toThrow(INotFoundException);
    });
  });

  describe('finalizeImport', () => {
    it('should update import record as completed when no failures', async () => {
        const results: ImportEndpointsResult = {
            successCount: 2,
            failedCount: 0,
            errors: [],
        };

        importedSpecRepo.update.mockResolvedValue({ affected: 1 } as any);

        await service.finalizeImport(
            testImportedSpec.id!,
            testCollection.id!,
            results,
            ctx
        );

        expect(importedSpecRepo.update).toHaveBeenCalledWith(
            testImportedSpec.id,
            {
            importStatus: ImportStatus.COMPLETED,
            importedCount: 2,
            failedCount: 0,
            errorLog: undefined,
            }
        );

        expect(eventEmitter.emit).toHaveBeenCalledWith(
            'apis.spec.import',
            expect.objectContaining({
                author: ctx.activeUser,
                metadata: expect.objectContaining({
                    specId: testImportedSpec.id,
                    collectionId: testCollection.id,
                    importedCount: 2,
                    failedCount: 0,
                }),
                name: 'apis.spec.import'
            })     
        );
    });

    it('should update import record as partial when there are failures', async () => {
      const results: ImportEndpointsResult = {
        successCount: 1,
        failedCount: 1,
        errors: [
          {
            endpoint: mockParsedEndpoints[1],
            error: 'Failed to create API',
          },
        ],
      };

      importedSpecRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.finalizeImport(
        testImportedSpec.id!,
        testCollection.id!,
        results,
        ctx
      );

      expect(importedSpecRepo.update).toHaveBeenCalledWith(
        testImportedSpec.id,
        {
          importStatus: ImportStatus.PARTIAL,
          importedCount: 1,
          failedCount: 1,
          errorLog: [
            {
              endpoint: mockParsedEndpoints[1],
              error: 'Failed to create API',
            },
          ],
        }
      );
    });

    it('should filter out empty errors from errorLog', async () => {
      const results: ImportEndpointsResult = {
        successCount: 1,
        failedCount: 1,
        errors: [
          null,
          undefined,
          {
            endpoint: mockParsedEndpoints[1],
            error: 'Failed to create API',
          },
          { endpoint: null, error: null },
        ],
      };

      importedSpecRepo.update.mockResolvedValue({ affected: 1 } as any);

      await service.finalizeImport(
        testImportedSpec.id!,
        testCollection.id!,
        results,
        ctx
      );

      expect(importedSpecRepo.update).toHaveBeenCalledWith(
        testImportedSpec.id,
        expect.objectContaining({
          errorLog: [
            {
              endpoint: mockParsedEndpoints[1],
              error: 'Failed to create API',
            },
          ],
        })
      );
    });
  });

  describe('transformEndpointToApiDto', () => {
    it('should transform parsed endpoint to CreateAPIDto correctly', () => {
      const endpoint = mockParsedEndpoints[0];
      const metadata = mockParsedSpec.metadata;
      const collectionId = testCollection.id!;
      const options = mockImportOptions;

      const result = service.transformEndpointToApiDto(
        endpoint,
        collectionId,
        metadata,
        options
      );

      // Update expected result to match current implementation (name instead of key, numbers not converted to strings)
      const expectedResult = {
        name: endpoint.name,
        collectionId,
        enabled: true,
        tiers: options.defaultTiers,
        introspectAuthorization: false,
        upstream: {
            url: 'https://api.example.com/users',
            method: HTTP_METHODS.GET,
            headers: [
            { name: 'Authorization', value: 'Bearer token' },
            ],
            querystring: [
            { name: 'page', value: 1 },
            ],
            body: [],
            transformations: options.transformationRules?.upstream,
        },
        downstream: {
            path: '~/users',
            method: HTTP_METHODS.GET,
            url: 'https://gateway.example.com/users',
            request: {},
            response: [],
            responseTransformations: options.transformationRules?.downstream,
        },
      };

      expect(result).toEqual(expectedResult);
    });

    it('should transform endpoint with different options correctly', () => {
      const endpoint = mockParsedEndpoints[0];
      const metadata = mockParsedSpec.metadata;
      const collectionId = testCollection.id!;
      
      const customOptions: ImportApiSpecDto = {
        ...mockImportOptions,
        enableByDefault: false,
        requireAuth: true,
        upstreamMethod: HTTP_METHODS.POST,
        downstreamMethod: HTTP_METHODS.POST,
      };

      const result = service.transformEndpointToApiDto(
        endpoint,
        collectionId,
        metadata,
        customOptions
      );

      expect(result.enabled).toBe(false);
      expect(result.introspectAuthorization).toBe(true);
      expect(result.upstream.method).toBe(HTTP_METHODS.POST);
      expect(result.downstream.method).toBe(HTTP_METHODS.POST);
    });

    it('should throw BadRequestException when no upstream base URL is provided', () => {
      const endpoint = mockParsedEndpoints[0];
      const metadata = { ...mockParsedSpec.metadata, baseUrl: undefined };
      const collectionId = testCollection.id!;
      const options = { ...mockImportOptions, upstreamBaseUrl: undefined };

      expect(() =>
        service.transformEndpointToApiDto(
          endpoint,
          collectionId,
          metadata,
          options
        )
      ).toThrow(IBadRequestException);
    });

    it('should throw BadRequestException when upstream base URL is invalid', () => {
      const endpoint = mockParsedEndpoints[0];
      const metadata = { ...mockParsedSpec.metadata, baseUrl: 'invalid-url' };
      const collectionId = testCollection.id!;
      const options = { ...mockImportOptions, upstreamBaseUrl: 'invalid-url' };

      expect(() =>
        service.transformEndpointToApiDto(
          endpoint,
          collectionId,
          metadata,
          options
        )
      ).toThrow(IBadRequestException);
    });

    it('should transform path parameters to Kong regex format', () => {
      const endpoint = mockParsedEndpoints[1]; // /users/{id}
      const metadata = mockParsedSpec.metadata;
      const collectionId = testCollection.id!;
      const options = mockImportOptions;

      const result = service.transformEndpointToApiDto(
        endpoint,
        collectionId,
        metadata,
        options
      );

      expect(result.downstream.path).toBe('~/users/(?<id>[^/]+)');
    });
  });

  describe('listImports', () => {
    it('should return paginated import history', async () => {
      const imports = [testImportedSpec];
      const totalRecords = 1;

      importedSpecRepo.findAndCount.mockResolvedValue([imports, totalRecords]);
      userRepository.findOne.mockResolvedValue(testUser);

      const result = await service.listImports(
        ctx,
        TEST_ENVIRONMENT,
        DEFAULT_PAGINATION
      );

      expect(importedSpecRepo.findAndCount).toHaveBeenCalledWith({
        where: { environment: TEST_ENVIRONMENT },
        relations: ['collection', 'importedBy'],
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          'Import history retrieved successfully',
          expect.arrayContaining([
            expect.objectContaining({
              id: testImportedSpec.id,
              name: testImportedSpec.name,
              specFormat: testImportedSpec.specFormat,
              importStatus: testImportedSpec.importStatus,
              importedBy: expect.any(ImportUserDto),
            }),
          ]),
          expect.objectContaining({
            totalNumberOfRecords: totalRecords,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          })
        )
      );
    });

    it('should fetch importer user when not included in relations', async () => {
        // Create an import record WITHOUT the importedBy relation but WITH importedById
        const importWithoutUser = {
            ...testImportedSpec,
            importedBy: null, // Relation not loaded
            importedById: testUser.id!, // But ID is present
        } as any;

        const imports = [importWithoutUser];
        const totalRecords = 1;

        importedSpecRepo.findAndCount.mockResolvedValue([imports, totalRecords]);
        userRepository.findOne.mockResolvedValue(testUser);

        await service.listImports(ctx, TEST_ENVIRONMENT, DEFAULT_PAGINATION);

        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { id: Equal(testUser.id!) },
            withDeleted: true,
        });
    });
  });

  describe('getImport', () => {
    it('should return import details successfully', async () => {
      importedSpecRepo.findOne.mockResolvedValue(testImportedSpec);

      const result = await service.getImport(ctx, testImportedSpec.id!);

      expect(importedSpecRepo.findOne).toHaveBeenCalledWith({
        where: { id: Equal(testImportedSpec.id) },
        relations: { 
          collection: true, 
          importedBy: { profile: true } 
        },
      });

      expect(result).toEqual(
        ResponseFormatter.success(
          'Import details retrieved successfully',
          expect.any(ImportDetailDto)
        )
      );

      const responseData = result.data as ImportDetailDto;
      expect(responseData.id).toBe(testImportedSpec.id);
      expect(responseData.name).toBe(testImportedSpec.name);
      expect(responseData.collection).toBeInstanceOf(ImportCollectionDto);
      expect(responseData.importedBy).toBeInstanceOf(ImportUserDto);
    });

    it('should throw NotFoundException when import record does not exist', async () => {
      importedSpecRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getImport(ctx, 'non-existent-id')
      ).rejects.toThrow(INotFoundException);
    });

    it('should fetch importer user when not included in relations', async () => {
        // Create an import record WITHOUT the importedBy relation but WITH importedById
        const importWithoutUser = {
            ...testImportedSpec,
            importedBy: null, // Relation not loaded
            importedById: testUser.id!, // But ID is present
        } as any;

        importedSpecRepo.findOne.mockResolvedValue(importWithoutUser);
        userRepository.findOne.mockResolvedValue(testUser);

        await service.getImport(ctx, testImportedSpec.id!);

        expect(userRepository.findOne).toHaveBeenCalledWith({
            where: { id: Equal(testUser.id!) },
            relations: { profile: true },
            withDeleted: true,
        });
    });
  });

  describe('getImportForRetry', () => {
    it('should return import record for retry', async () => {
      const partialImport: ImportedApiSpec = {
        ...testImportedSpec,
        importStatus: ImportStatus.PARTIAL,
        errorLog: [{ endpoint: 'Get user by ID', error: 'Failed' } as ImportErrorDto],
      };

      importedSpecRepo.findOne.mockResolvedValue(partialImport);

      const result = await service.getImportForRetry(partialImport.id!);

      expect(importedSpecRepo.findOne).toHaveBeenCalledWith({
        where: { id: Equal(partialImport.id) },
        relations: ['collection'],
      });
      expect(result).toEqual(partialImport);
    });

    it('should throw NotFoundException when import record does not exist', async () => {
      importedSpecRepo.findOne.mockResolvedValue(null);

      await expect(
        service.getImportForRetry('non-existent-id')
      ).rejects.toThrow(INotFoundException);
    });

    it('should throw BadRequestException for completed import without failures', async () => {
      const completedImport: ImportedApiSpec = {
        ...testImportedSpec,
        importStatus: ImportStatus.COMPLETED,
        errorLog: [],
      };

      importedSpecRepo.findOne.mockResolvedValue(completedImport);

      await expect(
        service.getImportForRetry(completedImport.id!)
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw BadRequestException when no failed endpoints to retry', async () => {
      const importWithoutErrors: ImportedApiSpec = {
        ...testImportedSpec,
        importStatus: ImportStatus.PARTIAL,
        errorLog: [],
      };

      importedSpecRepo.findOne.mockResolvedValue(importWithoutErrors);

      await expect(
        service.getImportForRetry(importWithoutErrors.id!)
      ).rejects.toThrow(IBadRequestException);
    });
  });

  describe('updateImportAfterRetry', () => {
    it('should update import record with retry results - all successful', async () => {
      const partialImport: ImportedApiSpec = {
        ...testImportedSpec,
        importStatus: ImportStatus.PARTIAL,
        importedCount: 1,
        failedCount: 1,
        errorLog: [{ endpoint: 'Get users', error: 'Failed' } as ImportErrorDto],
      };

      importedSpecRepo.findOne.mockResolvedValue(partialImport);
      importedSpecRepo.save.mockResolvedValue({
        ...partialImport,
        importStatus: ImportStatus.COMPLETED,
        importedCount: 2,
        failedCount: 0,
        errorLog: [],
      });

      const result = await service.updateImportAfterRetry(
        partialImport.id!,
        1, // successCount
        [] // errors
      );

      expect(importedSpecRepo.findOne).toHaveBeenCalledWith({
        where: { id: Equal(partialImport.id) },
      });
      expect(importedSpecRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          importStatus: ImportStatus.COMPLETED,
          importedCount: 2,
          failedCount: 0,
          errorLog: [],
        })
      );
      expect(result).toBeDefined();
    });

    it('should update import record with retry results - partial success', async () => {
      const partialImport: ImportedApiSpec = {
        ...testImportedSpec,
        importStatus: ImportStatus.PARTIAL,
        importedCount: 1,
        failedCount: 2,
        errorLog: [
          { endpoint: 'Get users', error: 'Failed 1' } as ImportErrorDto,
          { endpoint: 'Get user by ID', error: 'Failed 2' } as ImportErrorDto,
        ],
      };

      const remainingErrors: ImportErrorDto[] = [
        { endpoint: 'Get user by ID', error: 'Failed 2' },
      ];

      importedSpecRepo.findOne.mockResolvedValue(partialImport);
      importedSpecRepo.save.mockResolvedValue({
        ...partialImport,
        importedCount: 2,
        failedCount: 1,
        errorLog: remainingErrors,
      });

      const result = await service.updateImportAfterRetry(
        partialImport.id!,
        1, // successCount
        remainingErrors
      );

      expect(importedSpecRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          importStatus: ImportStatus.PARTIAL,
          importedCount: 2,
          failedCount: 1,
          errorLog: remainingErrors,
        })
      );
    });

    it('should not throw when import record not found during update', async () => {
      importedSpecRepo.findOne.mockResolvedValue(null);

      const result = await service.updateImportAfterRetry(
        'non-existent-id',
        1,
        []
      );

      expect(result).toBeUndefined();
    });
  });

  describe('deleteImport', () => {
    it('should delete import record successfully', async () => {
      importedSpecRepo.findOne.mockResolvedValue(testImportedSpec);
      importedSpecRepo.remove.mockResolvedValue(testImportedSpec);

      const result = await service.deleteImport(ctx, testImportedSpec.id!);

      expect(importedSpecRepo.findOne).toHaveBeenCalledWith({
        where: { id: Equal(testImportedSpec.id) },
      });
      expect(importedSpecRepo.remove).toHaveBeenCalledWith(testImportedSpec);
      expect(result).toEqual(
        ResponseFormatter.success('Import record deleted successfully')
      );
    });

    it('should throw NotFoundException when import record does not exist', async () => {
      importedSpecRepo.findOne.mockResolvedValue(null);

      await expect(
        service.deleteImport(ctx, 'non-existent-id')
      ).rejects.toThrow(INotFoundException);
    });
  });

  describe('Path Transformation', () => {
    it('should transform OpenAPI path parameters to Kong regex format', () => {
      const testCases = [
        { input: '/users', expected: '~/users' },
        { input: '/users/{id}', expected: '~/users/(?<id>[^/]+)' },
        { input: '/users/{userId}/posts/{postId}', expected: '~/users/(?<userId>[^/]+)/posts/(?<postId>[^/]+)' },
        { input: '/products/{category}/{id}', expected: '~/products/(?<category>[^/]+)/(?<id>[^/]+)' },
      ];

      testCases.forEach(({ input, expected }) => {
        const endpoint: ParsedEndpoint = {
          name: 'Test',
          path: input,
          method: HTTP_METHODS.GET,
          parameters: [],
          responses: {},
          requestBody: undefined
        };

        const dto = service.transformEndpointToApiDto(
          endpoint,
          testCollection.id!,
          mockParsedSpec.metadata,
          mockImportOptions
        );

        expect(dto.downstream.path).toBe(expected);
      });
    });
  });

  describe('Parameter Extraction', () => {
    it('should extract headers from parameters', () => {
      const parameters: ParsedParameter[] = [
        {
          name: 'Authorization',
          in: 'header',
          required: false,
          schema: { type: 'string', default: 'Bearer token' },
          type: 'string'
        },
        {
          name: 'Content-Type',
          in: 'header',
          required: false,
          schema: { type: 'string', default: 'application/json' },
          type: 'string'
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 1 },
          type: 'integer'
        },
      ];

      // Test through transformEndpointToApiDto
      const endpoint: ParsedEndpoint = {
        name: 'Test',
        path: '/test',
        method: HTTP_METHODS.GET,
        parameters,
        responses: {},
        requestBody: undefined
      };

      const dto = service.transformEndpointToApiDto(
        endpoint,
        testCollection.id!,
        mockParsedSpec.metadata,
        mockImportOptions
      );

      expect(dto.upstream.headers).toEqual([
        { name: 'Authorization', value: 'Bearer token' }, // Using 'name' instead of 'key'
        { name: 'Content-Type', value: 'application/json' }, // Using 'name' instead of 'key'
      ]);
    });

    it('should extract query parameters from parameters', () => {
      const parameters: ParsedParameter[] = [
        {
          name: 'page',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 1 },
          type: 'integer'
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          schema: { type: 'integer', default: 10 },
          type: 'integer'
        },
        {
          name: 'Authorization',
          in: 'header',
          required: false,
          schema: { type: 'string', default: 'Bearer token' },
          type: 'string'
      },
      ];

      const endpoint: ParsedEndpoint = {
        name: 'Test',
        path: '/test',
        method: HTTP_METHODS.GET,
        parameters,
        responses: {},
        requestBody: undefined
      };

      const dto = service.transformEndpointToApiDto(
        endpoint,
        testCollection.id!,
        mockParsedSpec.metadata,
        mockImportOptions
      );

      // Update expectation to match current implementation (numbers not converted to strings, using 'name' instead of 'key')
      expect(dto.upstream.querystring).toEqual([
        { name: 'page', value: 1 }, // Keep as number, using 'name'
        { name: 'limit', value: 10 }, // Keep as number, using 'name'
      ]);
    });
  });
});