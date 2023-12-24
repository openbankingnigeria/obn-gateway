import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUUID,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { HTTP_METHODS } from '../types';
import { Expose, Transform, Type } from 'class-transformer';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

class CreateRouteDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  paths: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(HTTP_METHODS, { each: true })
  @ArrayNotEmpty()
  methods: string[];
}

export class CreateAPIDto {
  @IsNotEmpty()
  @IsString()
  collectionId: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsObject()
  @ValidateNested()
  @Type(() => CreateRouteDTO)
  route: CreateRouteDTO;
}

class UpdateRouteDTO {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  paths: string[];

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsEnum(HTTP_METHODS, { each: true })
  @ArrayNotEmpty()
  methods: string[];
}

export class UpdateAPIDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsObject()
  @ValidateNested()
  @Type(() => UpdateRouteDTO)
  route: UpdateRouteDTO;
}

export class APIParam {
  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(KONG_ENVIRONMENT))
  environment: KONG_ENVIRONMENT;
}

export class GETAPIRouteResponseDTO {
  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }

  @IsArray()
  @Expose()
  @IsString({ each: true })
  paths: string[];

  @IsArray()
  @Expose()
  @IsString({ each: true })
  methods: string[];
}

export class GetAPIResponseDTO {
  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  enabled: boolean;

  @Expose()
  host: string;

  @Expose()
  protocol: string;

  @Expose()
  port: string;

  @Expose()
  path: string;

  @Expose()
  url: string;

  @Expose()
  aclAllowedGroupName: string;

  @Expose()
  @IsObject()
  @Type(() => GETAPIRouteResponseDTO)
  route: GETAPIRouteResponseDTO;
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
  method: string;

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
  constructor(partial: any) {
    Object.assign(this, partial);
  }

  @Expose()
  @Transform(({ obj }) => obj.request.headers['request-id'] || '')
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
}

export class AssignAPIsDto {
  @IsNotEmpty()
  @IsString({ each: true })
  @IsUUID('all', { each: true })
  apiIds: string[];
}
