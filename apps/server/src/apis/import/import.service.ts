import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';
import * as yaml from 'js-yaml';
import { ImportedApiSpec } from '@common/database/entities/importedapispec.entity';
import { Collection } from '@common/database/entities/collection.entity';
import { User } from '@common/database/entities/user.entity';
import { OpenApiV3Parser } from './parsers/openapi-v3.parser';
import { SwaggerV2Parser } from './parsers/swagger-v2.parser';
import { PostmanV2Parser } from './parsers/postman-v2.parser';
import { 
  IApiSpecParser, 
  ParsedEndpoint,
  ParsedSpecResult,
  ImportEndpointsResult,
} from './interfaces/parser.interface';
import { ImportApiSpecDto, ImportHistoryItemDto, ImportDetailDto, ImportResultDto, ImportErrorDto, ImportUserDto, ImportCollectionDto } from './dto/import.dto';
import { CreateAPIDto } from '../dto/index.dto';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { ImportStatus, SpecFormat } from '@common/database/entities/importedapispec.entity';
import { ImportApiSpecEvent } from '@shared/events/api.event';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { ResponseFormatter, ResponseMetaDTO } from '@common/utils/response/response.formatter';

@Injectable()
export class ApiSpecImportService {
  constructor(
    @InjectRepository(ImportedApiSpec)
    private readonly importedSpecRepo: Repository<ImportedApiSpec>,
  @InjectRepository(Collection)
  private readonly collectionRepo: Repository<Collection>,
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
    private readonly openApiV3Parser: OpenApiV3Parser,
    private readonly swaggerV2Parser: SwaggerV2Parser,
    private readonly postmanV2Parser: PostmanV2Parser,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private detectParser(spec: any): IApiSpecParser | null {
    const parsers = [
      this.openApiV3Parser,
      this.swaggerV2Parser,
      this.postmanV2Parser,
    ];

    for (const parser of parsers) {
      if (parser.canParse(spec)) {
        return parser;
      }
    }

    return null;
  }

  private parseSpecFile(content: string): any {
    try {
      return JSON.parse(content);
    } catch (jsonError) {
      try {
        return yaml.load(content);
      } catch (yamlError) {
        throw new IBadRequestException({
          message: 'Invalid file format. Must be valid JSON or YAML.',
        });
      }
    }
  }

  async parseAndValidateSpec(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    data: ImportApiSpecDto,
  ): Promise<ParsedSpecResult> {
    const spec = this.parseSpecFile(data.specFile);

    const parser = this.detectParser(spec);
    if (!parser) {
      throw new IBadRequestException({
        message: 'Unsupported API specification format',
        data: {
          supportedFormats: ['OpenAPI v2', 'OpenAPI v3', 'Postman Collection v2'],
        },
      });
    }

    const validation = parser.validate(spec);
    if (!validation.valid) {
      throw new IBadRequestException({
        message: 'Invalid API specification',
        data: { errors: validation.errors },
      });
    }

    const parsed = parser.parse(spec);
    const specInfo = parser.getSpecInfo(spec);

    return {
      spec,
      parser,
      parsed,
      specInfo,
    };
  }

  async createImportRecord(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    parsedSpec: ParsedSpecResult,
    options: ImportApiSpecDto,
  ): Promise<ImportedApiSpec> {
    const collection = await this.getOrCreateCollection(
      parsedSpec.parsed,
      options,
    );

    const importedSpec = await this.importedSpecRepo.save({
      name: options.specName || parsedSpec.parsed.metadata.title,
      specFormat: parsedSpec.specInfo.format as SpecFormat,
      specVersion: parsedSpec.specInfo.version,
      originalSpec: JSON.stringify(parsedSpec.spec),
      parsedMetadata: parsedSpec.parsed.metadata,
      importStatus: ImportStatus.PROCESSING,
      collection: collection,
      collectionId: collection.id,
      environment,
      importedById: ctx.activeUser.id,
    });

    return importedSpec;
  }

  async finalizeImport(
    importId: string,
    collectionId: string,
    results: ImportEndpointsResult,
    ctx: RequestContext,
  ): Promise<void> {
    // Only store errorLog if there are actual errors with content
    const errorLog = results.errors && results.errors.length > 0 
      ? results.errors.filter(err => err && (err.endpoint || err.error))
      : [];

    await this.importedSpecRepo.update(importId, {
      importStatus: results.failedCount > 0 
        ? ImportStatus.PARTIAL 
        : ImportStatus.COMPLETED,
      importedCount: results.successCount,
      failedCount: results.failedCount,
      errorLog: errorLog.length > 0 ? errorLog : undefined,
    });

    const event = new ImportApiSpecEvent(ctx.activeUser, {
      specId: importId,
      collectionId,
      importedCount: results.successCount,
      failedCount: results.failedCount,
    });
    this.eventEmitter.emit(event.name, event);
  }

  transformEndpointToApiDto(
    endpoint: ParsedEndpoint,
    collectionId: string,
    metadata: any,
    options: ImportApiSpecDto,
  ): CreateAPIDto {
    const upstreamUrl = this.constructUpstreamUrl(
      endpoint,
      metadata,
      options.upstreamBaseUrl,
    );

    return {
      name: endpoint.name,
      collectionId,
      enabled: options.enableByDefault ?? true,
      tiers: (options.defaultTiers || []) as any,
      introspectAuthorization: options.requireAuth ?? false,
      upstream: {
        url: upstreamUrl,
        method: options.upstreamMethod || endpoint.method,
        headers: this.extractHeaders(endpoint.parameters || []),
        querystring: this.extractQueryParams(endpoint.parameters || []),
        body: this.extractBodyParams(endpoint.requestBody),
        transformations: options.transformationRules?.upstream,
      },
      downstream: {
        path: this.transformPath(endpoint.path),
        method: (options.downstreamMethod || endpoint.method) as any,
        url: options.downstreamBaseUrl
          ? `${options.downstreamBaseUrl}${endpoint.path}`
          : '',
        request: this.transformRequest(endpoint),
        response: this.transformResponses(endpoint.responses),
        responseTransformations: options.transformationRules?.downstream,
      },
    };
  }

  private async getOrCreateCollection(
    parsed: any,
    options: ImportApiSpecDto,
  ): Promise<Collection> {
    if (options.collectionId) {
      const collection = await this.collectionRepo.findOne({
        where: { id: Equal(options.collectionId) },
      });
      if (!collection) {
        throw new INotFoundException({
          message: `Collection ${options.collectionId} not found`,
        });
      }
      return collection;
    }

    // Create new collection
    const collection = await this.collectionRepo.save({
      name: options.collectionName || parsed.metadata.title,
      slug: slugify(options.collectionName || parsed.metadata.title, {
        lower: true,
        strict: true,
      }),
      description: parsed.metadata.description,
    });

    return collection;
  }

  private constructUpstreamUrl(
    endpoint: ParsedEndpoint,
    metadata: any,
    override?: string,
  ): string {
    const baseUrl = override || metadata.baseUrl || '';
    
    // If no base URL is provided, we cannot construct a valid upstream URL
    if (!baseUrl) {
      throw new IBadRequestException({
        message: `Cannot import endpoint ${endpoint.method} ${endpoint.path}: No upstream base URL provided. Please specify an upstream base URL in the import configuration.`,
      });
    }

    // Validate that baseUrl is a valid URL
    try {
      new URL(baseUrl);
    } catch (error) {
      throw new IBadRequestException({
        message: `Invalid upstream base URL: ${baseUrl}. Please provide a valid URL (e.g., https://api.example.com)`,
      });
    }

    // Convert {param} to :param for upstream URL
    const expressPath = endpoint.path.replace(/\{([^}]+)\}/g, ':$1');
    return `${baseUrl}${expressPath}`;
  }

  /**
   * Transform OpenAPI-style path to Kong regex format
   * Example: /users/{userId} -> ~/users/(?<userId>[^/]+)
   */
  private transformPath(path: string): string {
    // Convert {paramName} to Kong's named capture group format
    const kongPath = path.replace(/\{([^}]+)\}/g, '(?<$1>[^/]+)');
    return `~${kongPath}`;
  }

  private extractHeaders(parameters: any[]): any[] {
    if (!parameters) return [];
    return parameters
      .filter((p) => p.in === 'header' && p.schema?.default)
      .map((p) => ({ name: p.name, value: p.schema.default }));
  }

  private extractQueryParams(parameters: any[]): any[] {
    if (!parameters) return [];
    return parameters
      .filter((p) => p.in === 'query' && p.schema?.default)
      .map((p) => ({ name: p.name, value: p.schema.default }));
  }

  private extractBodyParams(requestBody: any): any[] {
    return [];
  }

  private transformRequest(endpoint: ParsedEndpoint): any {
    return {};
  }

  private transformResponses(responses: any): any[] {
    return [];
  }
  async listImports(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    { limit, page }: PaginationParameters,
  ) {
    const [imports, totalNumberOfRecords] = await this.importedSpecRepo.findAndCount({
      where: { environment },
      relations: ['collection', 'importedBy'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform to DTOs for proper serialization
    const importDtos = await Promise.all(
      imports.map(async (imp) => {
        if (!imp.importedBy && imp.importedById) {
          const importer = await this.userRepository.findOne({
            where: { id: Equal(imp.importedById) },
            withDeleted: true,
          });

          if (importer) {
            imp.importedBy = importer;
          }
        }

        return Object.assign(new ImportHistoryItemDto(), {
        id: imp.id,
        name: imp.name,
        specFormat: imp.specFormat,
        specVersion: imp.specVersion,
        importStatus: imp.importStatus,
        importedCount: imp.importedCount || 0,
        failedCount: imp.failedCount || 0,
        collectionId: imp.collectionId,
        environment: imp.environment,
        createdAt: imp.createdAt,
        updatedAt: imp.updatedAt,
          importedBy: imp.importedBy
            ? Object.assign(new ImportUserDto(), {
                id: imp.importedBy.id,
                email: imp.importedBy.email,
              })
            : undefined,
        });
      }),
    );

    return ResponseFormatter.success(
      'Import history retrieved successfully',
      importDtos,
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async getImport(
    ctx: RequestContext,
    importId: string,
  ) {
    const importRecord = await this.importedSpecRepo.findOne({
      where: { id: Equal(importId) },
      relations: { 
        collection: true, 
        importedBy: { profile: true } 
      },
    });

    if (!importRecord?.importedBy && importRecord?.importedById) {
      const importer = await this.userRepository.findOne({
        where: { id: Equal(importRecord.importedById) },
        relations: { profile: true },
        withDeleted: true,
      });

      if (importRecord && importer) {
        importRecord.importedBy = importer;
      }
    }

    if (!importRecord) {
      throw new INotFoundException({
        message: `Import record ${importId} not found`,
      });
    }

    const responseData = Object.assign(new ImportDetailDto(), {
      id: importRecord.id,
      name: importRecord.name,
      specFormat: importRecord.specFormat,
      specVersion: importRecord.specVersion,
      importStatus: importRecord.importStatus,
      importedCount: importRecord.importedCount || 0,
      failedCount: importRecord.failedCount || 0,
      collectionId: importRecord.collectionId,
      environment: importRecord.environment,
      parsedMetadata: importRecord.parsedMetadata,
      errorLog: (importRecord.errorLog || []).map((error) =>
        Object.assign(new ImportErrorDto(), error),
      ),
      originalSpec: importRecord.originalSpec,
      createdAt: importRecord.createdAt,
      updatedAt: importRecord.updatedAt,
      importedBy: importRecord.importedBy
        ? Object.assign(new ImportUserDto(), {
            id: importRecord.importedBy.id,
            email: importRecord.importedBy.email,
            firstName: importRecord.importedBy.profile?.firstName || null,
            lastName: importRecord.importedBy.profile?.lastName || null,
          })
        : null,
      collection: importRecord.collection
        ? Object.assign(new ImportCollectionDto(), {
            id: importRecord.collection.id,
            name: importRecord.collection.name,
            slug: importRecord.collection.slug,
          })
        : null,
    });

    return ResponseFormatter.success(
      'Import details retrieved successfully',
      responseData,
    );
  }

  async getImportForRetry(
    importId: string,
  ) {
    const importRecord = await this.importedSpecRepo.findOne({
      where: { id: Equal(importId) },
      relations: ['collection'],
    });

    if (!importRecord) {
      throw new INotFoundException({
        message: `Import record ${importId} not found`,
      });
    }

    // Can only retry failed or partial imports
    if (importRecord.importStatus === ImportStatus.COMPLETED) {
      throw new IBadRequestException({
        message: 'Cannot retry a completed import with no failures',
      });
    }

    if (!importRecord.errorLog || importRecord.errorLog.length === 0) {
      throw new IBadRequestException({
        message: 'No failed endpoints to retry',
      });
    }

    return importRecord;
  }

  async updateImportAfterRetry(
    importId: string,
    successCount: number,
    errors: ImportErrorDto[],
  ) {
    const importRecord = await this.importedSpecRepo.findOne({
      where: { id: Equal(importId) },
    });

    if (!importRecord) {
      return;
    }

    // Update the import record with retry results
    const newFailedCount = errors.length;
    const newImportedCount = importRecord.importedCount + successCount;

    // Only store errorLog if there are actual errors with content
    const filteredErrors = errors && errors.length > 0 
      ? errors.filter(err => err && (err.endpoint || err.error))
      : [];

    importRecord.errorLog = filteredErrors;
    importRecord.failedCount = newFailedCount;
    importRecord.importedCount = newImportedCount;

    // Update status based on results
    if (newFailedCount === 0) {
      importRecord.importStatus = ImportStatus.COMPLETED;
    } else if (successCount > 0) {
      importRecord.importStatus = ImportStatus.PARTIAL;
    } else {
      importRecord.importStatus = ImportStatus.FAILED;
    }

    await this.importedSpecRepo.save(importRecord);

    return importRecord;
  }

  async deleteImport(
    ctx: RequestContext,
    importId: string,
  ) {
    const importRecord = await this.importedSpecRepo.findOne({
      where: { id: Equal(importId) },
    });

    if (!importRecord) {
      throw new INotFoundException({
        message: `Import record ${importId} not found`,
      });
    }

    await this.importedSpecRepo.remove(importRecord);

    return ResponseFormatter.success(
      'Import record deleted successfully',
    );
  }
}
