import { settingsErrors } from '@settings/settings.errors';
import { KybDataTypes, KybSettings } from '@settings/types';
import { Expose, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class KybRequirements {
  @IsNotEmpty({
    message: ({ property }) => settingsErrors.dto.isRequired(property),
  })
  @IsString()
  name: string;

  @IsNotEmpty({
    message: ({ property }) => settingsErrors.dto.isRequired(property),
  })
  @IsString()
  label: string;

  @IsNotEmpty({
    message: ({ property }) => settingsErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEnum(KybDataTypes)
  type: KybDataTypes;
}

export class UpdateKybRequirementsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KybRequirements)
  newKybRequirements: KybRequirements[];

  @IsOptional()
  @Type(() => String)
  @IsArray()
  removedKybRequirements: string[];
}

export class KybRequirementsResponse {
  constructor(partial: Partial<KybSettings['kybRequirements'][0]>) {
    Object.assign(this, partial);
  }

  @Expose()
  name: string;

  @Expose()
  label: string;

  @Expose()
  type: string;

  @Expose()
  editable: boolean;

  @Expose()
  maxCount: number;
}

export class ApiKeyResponse {
  constructor(partial: Partial<{ key: string | null; environment: string }>) {
    Object.assign(this, partial);
  }

  @Expose()
  key: string;

  @Expose()
  environment: string;
}

export class IPRestrictionRequest {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @IsIP(undefined, { each: true })
  @ArrayNotEmpty()
  ips: string[];
}

export class IPRestrictionResponse {
  constructor(partial: Partial<{ ips: string[]; environment: string }>) {
    Object.assign(this, partial);
  }

  @Expose()
  @IsArray()
  ips: string[];

  @Expose()
  environment: string;
}
