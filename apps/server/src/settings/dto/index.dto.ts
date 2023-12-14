import { settingsErrors } from '@settings/settings.errors';
import { KybDataTypes, KybSettings } from '@settings/types';
import { Expose, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
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
