import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { HTTP_METHODS } from '../types';
import { Expose, Type } from 'class-transformer';
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
  @IsObject()
  @Type(() => GETAPIRouteResponseDTO)
  route: GETAPIRouteResponseDTO;
}
