import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { HTTP_METHODS } from '../types';
import { Expose, Type } from 'class-transformer';
import { Collection } from '@common/database/entities/collection.entity';

export class CreateCollectionDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}

export class UpdateCollectionDto {
  @IsNotEmpty()
  @IsString()
  description: string;
}

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

export class GetCollectionResponseDTO {
  constructor(partial: Partial<Collection>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;
}

export class GETAPIRouteResponseDTO {
  constructor(partial: Partial<any>) {
    Object.assign(this, partial);
  }

  @IsArray()
  @IsString({ each: true })
  paths: string[];

  @IsArray()
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
