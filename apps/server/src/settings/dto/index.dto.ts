import { settingsErrors } from '@settings/settings.errors';
import { KybDataTypes } from '@settings/types';
import { Type } from 'class-transformer';
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
