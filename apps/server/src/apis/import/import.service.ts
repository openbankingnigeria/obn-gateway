import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import slugify from 'slugify';
import * as yaml from 'js-yaml';
import { ImportedApiSpec } from '@common/database/entities/importedapispec.entity';
import { Collection } from '@common/database/entities/collection.entity';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { APIService } from '../apis.service';
import { OpenApiV3Parser } from './parsers/openapi-v3.parser';
import { SwaggerV2Parser } from './parsers/swagger-v2.parser';
import { PostmanV2Parser } from './parsers/postman-v2.parser';
import { IApiSpecParser, ParsedEndpoint } from './interfaces/parser.interface';
import { ImportApiSpecDto, ImportResultDto } from './dto/import.dto';
import { CreateAPIDto } from '../dto/index.dto';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { ImportStatus, SpecFormat } from '@common/database/entities/importedapispec.entity';

@Injectable()
export class ApiSpecImportService {
  constructor(
    @InjectRepository(ImportedApiSpec)
    private readonly importedSpecRepo: Repository<ImportedApiSpec>,
    @InjectRepository(Collection)
    private readonly collectionRepo: Repository<Collection>,
    @InjectRepository(CollectionRoute)
    private readonly collectionRouteRepo: Repository<CollectionRoute>,
    private readonly apiService: APIService,
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

  async importApiSpec(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    data: ImportApiSpecDto,
  ): Promise<ImportResultDto> {
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

    let collection: Collection | null;
    if (data.collectionId) {
      collection = await this.collectionRepo.findOne({
        where: { id: Equal(data.collectionId) },
      });
      if (!collection) {
        throw new INotFoundException({
          message: `Collection ${data.collectionId} not found`,
        });
      }
    } else {
      collection = await this.collectionRepo.save({
        name: data.collectionName || parsed.metadata.title,
        slug: slugify(data.collectionName || parsed.metadata.title, {
          lower: true,
          strict: true,
        }),
        description: parsed.metadata.description,
      });
    }

    if (!collection) {
      throw new INotFoundException({
        message: 'Failed to get or create collection',
      });
    }

    const importedSpec = await this.importedSpecRepo.save({
      name: data.specName || parsed.metadata.title,
      specFormat: specInfo.format as SpecFormat,
      specVersion: specInfo.version,
      originalSpec: JSON.stringify(spec),
      parsedMetadata: parsed.metadata,
      importStatus: ImportStatus.PROCESSING,
      collectionId: collection.id,
      environment,
      importedById: ctx.activeUser.id,
    });

    const results = await this.importEndpoints(
      ctx,
      environment,
      collection,
      parsed.endpoints,
      importedSpec,
      data,
    );

    await this.importedSpecRepo.update(importedSpec.id, {
      importStatus: results.failedCount > 0 ? ImportStatus.PARTIAL : ImportStatus.COMPLETED,
      importedCount: results.successCount,
      failedCount: results.failedCount,
      errorLog: results.errors,
    });

    this.eventEmitter.emit('api.spec.imported', {
      userId: ctx.activeUser.id,
      companyId: ctx.activeUser.company?.id,
      event: 'API_SPEC_IMPORTED',
      details: {
        specId: importedSpec.id,
        collectionId: collection.id!,
        importedCount: results.successCount,
        failedCount: results.failedCount,
      },
    });

    return {
      importId: importedSpec.id,
      collectionId: collection.id!,
      totalEndpoints: parsed.endpoints.length,
      successCount: results.successCount,
      failedCount: results.failedCount,
      status: results.failedCount > 0 ? 'partial' : 'completed',
      errors: results.errors,
    };
  }

  private async importEndpoints(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    collection: Collection,
    endpoints: ParsedEndpoint[],
    importedSpec: ImportedApiSpec,
    options: ImportApiSpecDto,
  ): Promise<{ successCount: number; failedCount: number; errors: any[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    for (const endpoint of endpoints) {
      try {
        const apiDto = this.transformToApiDto(
          endpoint,
          collection,
          importedSpec.parsedMetadata,
          options,
        );

        await this.apiService.createAPI(ctx, environment, apiDto);
        successCount++;
      } catch (error: any) {
        failedCount++;
        errors.push({
          endpoint: `${endpoint.method} ${endpoint.path}`,
          error: error.message || 'Unknown error',
          details: error.response?.data || undefined,
        });
      }
    }

    return { successCount, failedCount, errors };
  }

  private transformToApiDto(
    endpoint: ParsedEndpoint,
    collection: Collection,
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
      collectionId: collection.id!,
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
