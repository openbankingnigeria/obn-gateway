import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
} from 'class-validator';
import { HTTP_METHODS } from '../types';

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

export class CreateAPIDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  route: CreateRouteDTO;
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

export class UpdateAPIDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsNotEmpty()
  @IsUrl()
  url: string;

  route: UpdateRouteDTO;
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
