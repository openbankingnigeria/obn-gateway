import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { HTTP_METHODS } from '../types';
import { Expose, Transform, Type } from 'class-transformer';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { GetCompanyResponseDTO } from '@company/dto/index.dto';
import moment from 'moment';
import { RequestContext } from '@common/utils/request/request-context';
import { PERMISSIONS } from '@permissions/types';
import { CompanyTypes } from '@common/database/constants';
import {
  IsNumberOrArrayOfNumbers,
  IsStringOrArrayOfStrings,
} from '@common/utils/request/request.decorator';
import { CompanyTiers } from '@company/types';

class MappingOperationDTO {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['add', 'remove', 'rename', 'replace'])
  operation: 'add' | 'remove' | 'rename' | 'replace';

  @IsString()
  @IsOptional()
  value?: string;
}

class TransformationsDTO {
  @IsOptional()
  @IsString()
  @IsEnum(HTTP_METHODS)
  method?: HTTP_METHODS;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingOperationDTO)
  headerMappings?: MappingOperationDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingOperationDTO)
  querystringMappings?: MappingOperationDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingOperationDTO)
  bodyMappings?: MappingOperationDTO[];
}

class ResponseTransformationsDTO {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingOperationDTO)
  headerMappings?: MappingOperationDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MappingOperationDTO)
  bodyMappings?: MappingOperationDTO[];
}

class CreateAPIDownstreamDTO {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  @IsUrl({ host_whitelist: [/.*/] })
  url: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(HTTP_METHODS)
  method: HTTP_METHODS;

  @Type(() => Map)
  @IsOptional()
  request?: any;

  @Type(() => Map)
  @IsOptional()
  response?: any[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTransformationsDTO)
  responseTransformations?: ResponseTransformationsDTO;
}

class CreateAPIUpstreamDTO {
  @IsNotEmpty()
  @IsUrl({ host_whitelist: [/.*/] })
  url: string;

  @IsOptional()
  @IsString()
  @IsEnum(HTTP_METHODS)
  method?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  headers?: KVDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  querystring?: KVDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  body?: KVDTO[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TransformationsDTO)
  transformations?: TransformationsDTO;
}

export class CreateAPIDto {
  constructor(partial: CreateAPIDto) {
    Object.assign(this, partial);
  }

  @IsNotEmpty()
  @IsString()
  collectionId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateAPIUpstreamDTO)
  upstream: CreateAPIUpstreamDTO;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateAPIDownstreamDTO)
  downstream: CreateAPIDownstreamDTO;

  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Handle comma-separated string input
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim());
    }
    return value;
  })
  @IsEnum(CompanyTiers, { each: true })
  tiers: (number | `${number}`)[];

  @IsBoolean()
  @IsOptional()
  introspectAuthorization: boolean;
}

class UpdateAPIDownstreamDTO {
  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  @IsUrl({ host_whitelist: [/.*/] })
  url: string;

  @IsString()
  @IsNotEmpty()
  method: HTTP_METHODS;

  @Type(() => Map)
  @IsOptional()
  request?: any;

  @Type(() => Map)
  @IsOptional()
  response?: any[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => ResponseTransformationsDTO)
  responseTransformations?: ResponseTransformationsDTO;
}

class KVDTO {
  @Expose()
  @IsString()
  key: string;

  @Expose()
  @IsString()
  value: string;
}

class UpdateAPIUpstreamDTO {
  @IsNotEmpty()
  @IsUrl({ host_whitelist: [/.*/] })
  url: string;

  @IsOptional()
  @IsString()
  @IsEnum(HTTP_METHODS)
  method?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  headers?: KVDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  querystring?: KVDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KVDTO)
  body?: KVDTO[];

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TransformationsDTO)
  transformations?: TransformationsDTO;
}

export class UpdateAPIDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAPIUpstreamDTO)
  upstream?: UpdateAPIUpstreamDTO;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UpdateAPIDownstreamDTO)
  downstream?: UpdateAPIDownstreamDTO;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsEnum(CompanyTiers, { each: true })
  tiers?: (number | `${number}`)[];

  @IsBoolean()
  @IsOptional()
  introspectAuthorization: boolean;
}

export class APIParam {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(KONG_ENVIRONMENT))
  environment: KONG_ENVIRONMENT;
}

export class GETAPIDownstreamResponseDTO {
  constructor(partial: GETAPIDownstreamResponseDTO, ctx?: RequestContext) {
    Object.assign(this, partial);
  }

  @Expose()
  url: string;

  @Expose()
  path: string | null;

  @Expose()
  method: HTTP_METHODS | null;

  @Type(() => Map)
  @Expose()
  request?: Map<string, any>;

  @Type(() => Map)
  @Expose()
  response?: Map<string, any>[];
}

export class GETAPIUpstreamResponseDTO {
  constructor(
    partial: Partial<GETAPIUpstreamResponseDTO>,
    ctx?: RequestContext,
  ) {
    if (
      ctx?.hasPermission(PERMISSIONS.ADD_API_ENDPOINT) &&
      ctx?.activeCompany.type === CompanyTypes.API_PROVIDER
    ) {
      Object.assign(this, partial);
    }
  }

  @Expose()
  url: string | null;

  @Expose()
  method?: string;

  @Expose()
  @Type(() => KVDTO)
  headers?: KVDTO[];

  @Expose()
  @Type(() => KVDTO)
  querystring?: KVDTO[];

  @Expose()
  @Type(() => KVDTO)
  body?: KVDTO[];
}

export class GetAPIResponseDTO {
  constructor(partial: GetAPIResponseDTO, ctx?: RequestContext) {
    Object.assign(this, partial);
    if (
      'upstream' in this &&
      (!ctx?.hasPermission(PERMISSIONS.ADD_API_ENDPOINT) ||
        ctx?.activeCompany.type !== CompanyTypes.API_PROVIDER)
    ) {
      this.upstream = null;
    }
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  enabled: boolean;

  @Expose()
  introspectAuthorization: boolean;

  @Expose()
  collectionId: string;

  @Expose()
  tiers: (number | `${number}`)[];

  @Expose()
  @IsObject()
  @Type(() => GETAPIDownstreamResponseDTO)
  downstream?: GETAPIDownstreamResponseDTO;

  @Expose()
  @IsObject()
  @Type(() => GETAPIUpstreamResponseDTO)
  upstream?: GETAPIUpstreamResponseDTO | null;
}

class APILogResponseDto {
  @Type(() => Map)
  @Expose()
  headers: Map<string, any>;

  @IsInt()
  @Expose()
  status: number;

  @IsInt()
  @Expose()
  size: number;
}

class APILogLatenciesDto {
  @IsInt()
  @Expose()
  kong: number;

  @IsInt()
  @Expose()
  request: number;

  @IsInt()
  @Expose()
  proxy: number;
}

class APILogRequestDto {
  @Type(() => Map)
  @Expose()
  querystring: Record<string, any>;

  @IsString()
  @Expose()
  method: HTTP_METHODS | null;

  @IsString()
  @Expose()
  uri: string;

  @IsString()
  @Expose()
  url: string;

  @Type(() => Map)
  @Expose()
  headers: Map<string, any>;

  @IsInt()
  @Expose()
  size: number;
}

export class APILogResponseDTO {
  constructor(partial: any, ctx?: RequestContext) {
    Object.assign(this, partial);
  }

  @Expose()
  @Transform(({ obj }) => obj.response.headers['x-request-id'] || '')
  id: string;

  @Expose()
  @Transform(({ obj }) => obj.route?.name)
  name: string;

  @IsString()
  @Expose({ name: 'clientIp' })
  'client_ip': string;

  @IsString()
  @Expose({ name: 'timestamp' })
  '@timestamp': string;

  @ValidateNested()
  @Type(() => APILogResponseDto)
  @Expose()
  response: APILogResponseDto;

  @ValidateNested()
  @Type(() => APILogLatenciesDto)
  @Expose()
  latencies: APILogLatenciesDto;

  @ValidateNested()
  @Type(() => APILogRequestDto)
  @Expose()
  request: APILogRequestDto;

  @ValidateNested()
  @Type(() => GetCompanyResponseDTO)
  @Expose({ name: 'company' })
  consumer: GetCompanyResponseDTO;
}

export class UpdateCompanyAPIAccessDto {
  @IsNotEmpty()
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  @ArrayUnique()
  apiIds: string[];
}
export class APILogStatsResponseDTO {
  constructor(partial: any, ctx?: RequestContext) {
    Object.assign(this, partial);
  }

  @Expose()
  @Transform(({ obj }) => obj.totalCount?.value)
  totalCount: number;

  @Expose()
  @Transform(({ obj }) => obj.avgRequestLatency?.value)
  avgRequestLatency: number;

  @Expose()
  @Transform(({ obj }) => obj.avgGatewayLatency?.value)
  avgGatewayLatency: number;

  @Expose()
  @Transform(({ obj }) => obj.avgProxyLatency?.value)
  avgProxyLatency: number;

  @Expose()
  @Transform(({ obj }) => obj.avgCountPerSecond?.value)
  avgCountPerSecond: number;

  @Expose()
  @Transform(({ obj }) => obj.successCount?.doc_count)
  successCount: number;

  @Expose()
  @Transform(({ obj }) => obj.failedCount?.doc_count)
  failedCount: number;
}

class GetAPILogsFilterCreatedAtDto {
  @IsOptional()
  @IsDateString()
  'gt': string;

  @IsOptional()
  @IsDateString()
  'lt': string;
}

export class GetAPILogsFilterDto {
  @Expose({ name: 'createdAt' })
  @ValidateNested()
  @Type(() => GetAPILogsFilterCreatedAtDto)
  '@timestamp': GetAPILogsFilterCreatedAtDto;

  @Expose({ name: 'companyId' })
  @IsOptional()
  @IsString()
  'consumer.id': string;

  @Expose({ name: 'apiId' })
  @IsOptional()
  @IsStringOrArrayOfStrings()
  'route.id': string;

  @Expose({ name: 'status' })
  @IsOptional()
  @IsNumberOrArrayOfNumbers()
  'response.status': string;

  @Expose()
  @IsOptional()
  @IsStringOrArrayOfStrings()
  'collectionId': string;
}

export class GetAPILogsDto {
  @ValidateNested()
  @Type(() => GetAPILogsFilterDto)
  filter: GetAPILogsFilterDto;
}

export class GetStatsAggregateResponseDTO {
  constructor(partial: GetStatsAggregateResponseDTO, ctx?: RequestContext) {
    Object.assign(this, partial);
  }

  @Expose({ name: 'count' })
  doc_count: number;

  @Expose({ name: 'value' })
  @Transform(({ obj }) => moment(obj.key_as_string).format('YYYY-MM-DD'))
  key_as_string: string;
}

export class SetAPITransformationDTO {
  @IsString()
  upstream: string;

  @IsString()
  downstream: string;
}

export class GetAPITransformationResponseDTO {
  constructor(
    partial: Partial<GetAPITransformationResponseDTO>,
    ctx?: RequestContext,
  ) {
    if (
      (ctx?.hasPermission(PERMISSIONS.SET_API_TRANSFORMATION) ||
        ctx?.hasPermission(PERMISSIONS.VIEW_API_TRANSFORMATION)) &&
      ctx?.activeCompany.type === CompanyTypes.API_PROVIDER
    ) {
      Object.assign(this, partial);
    }
  }

  @Expose({ name: 'upstream' })
  @Transform(({ value }) => value[0])
  @IsString()
  access: string;

  @Expose({ name: 'downstream' })
  @Transform(({ value }) => value[0])
  @IsString()
  header_filter: string;
}
