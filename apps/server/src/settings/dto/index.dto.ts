import { KybDataTypes } from '@settings/types';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class KybRequirements {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(KybDataTypes)
  type: KybDataTypes;
}

export class UpdateKybRequirementsDto {
  @IsNotEmpty()
  @IsArray()
  kybRequirements: KybRequirements[];
}
