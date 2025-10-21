import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';
import * as yaml from 'js-yaml';
import { ImportedApiSpec } from '@common/database/entities/importedapispec.entity';
import { Collection } from '@common/database/entities/collection.entity';
import { OpenApiV3Parser } from './parsers/openapi-v3.parser';
import { SwaggerV2Parser } from './parsers/swagger-v2.parser';
import { PostmanV2Parser } from './parsers/postman-v2.parser';
import { 
  IApiSpecParser, 
  ParsedEndpoint,
  ParsedSpecResult,
  ImportEndpointsResult,
} from './interfaces/parser.interface';
import { ImportApiSpecDto } from './dto/import.dto';
import { CreateAPIDto } from '../dto/index.dto';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { ImportStatus, SpecFormat } from '@common/database/entities/importedapispec.entity';
import { ImportApiSpecEvent } from '@shared/events/api.event';

@Injectable()
export class ApiSpecImportService {
  constructor(
    @InjectRepository(ImportedApiSpec)
    private readonly importedSpecRepo: Repository<ImportedApiSpec>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    // Removed: CollectionRoute repository (not needed)
    // Removed: APIService injection (violates architecture)
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

  /**
   * Parse and validate an API spec file
   * Returns parsed spec data ready for import
   */
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

  /**
   * Create an import record in the database
   * Returns the created ImportedApiSpec entity
   */
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
      collectionId: collection.id,
      environment,
      importedById: ctx.activeUser.id,
    });

    return importedSpec;
  }

  /**
   * Finalize an import record after endpoint creation
   * Updates status and counts, emits audit event
   */
  async finalizeImport(
    importId: string,
    collectionId: string,
    results: ImportEndpointsResult,
    ctx: RequestContext,
  ): Promise<void> {
    await this.importedSpecRepo.update(importId, {
      importStatus: results.failedCount > 0 
        ? ImportStatus.PARTIAL 
        : ImportStatus.COMPLETED,
      importedCount: results.successCount,
      failedCount: results.failedCount,
      errorLog: results.errors,
    });

    const event = new ImportApiSpecEvent(ctx.activeUser, {
      specId: importId,
      collectionId,
      importedCount: results.successCount,
      failedCount: results.failedCount,
    });
    this.eventEmitter.emit(event.name, event);
  }

  /**
   * Transform a parsed endpoint to CreateAPIDto
   * Pure transformation function with no side effects
   */
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
        method: endpoint.method,
        headers: this.extractHeaders(endpoint.parameters || []),
        querystring: this.extractQueryParams(endpoint.parameters || []),
        body: this.extractBodyParams(endpoint.requestBody),
      },
      downstream: {
        path: this.transformPath(endpoint.path),
        method: endpoint.method,
        url: options.downstreamBaseUrl
          ? `${options.downstreamBaseUrl}${endpoint.path}`
          : '',
        request: this.transformRequest(endpoint),
        response: this.transformResponses(endpoint.responses),
      },
    };
  }

  /**
   * Get or create a collection for the import
   * Private helper method
   */
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
    return `${baseUrl}${endpoint.path}`;
  }

  private transformPath(path: string): string {
    return path.replace(/\{([^}]+)\}/g, ':$1');
  }

  private extractHeaders(parameters: any[]): any[] {
    if (!parameters) return [];
    return parameters
      .filter((p) => p.in === 'header')
      .map((p) => ({ name: p.name, value: p.schema?.default || '' }));
  }

  private extractQueryParams(parameters: any[]): any[] {
    if (!parameters) return [];
    return parameters
      .filter((p) => p.in === 'query')
      .map((p) => ({ name: p.name, value: p.schema?.default || '' }));
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
}
