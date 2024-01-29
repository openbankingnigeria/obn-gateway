import {
  IsAlphanumeric,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
  // Length,
} from 'class-validator';
import { companyValidationErrors } from '../company.config';
import { CompanyTypes } from '@common/database/constants';
import { Expose, Type } from 'class-transformer';
import { CompanySubtypes } from '@settings/types';

export enum KybStatusActions {
  APPROVE = 'approve',
  DENY = 'deny',
}

export class UpdateCompanyDetailsDto {
  @IsNotEmpty({
    message: ({ property }) => companyValidationErrors.dto.isRequired(property),
  })
  @IsAlphanumeric('en-US', {
    message: ({ property }) =>
      companyValidationErrors.dto.typeMismatch(
        property,
        'alphabets and numbers',
      ),
  })
  @Length(15, 15, { message: 'rcNumber must be exactly 15 digits long.' })
  rcNumber: string;
}

export class UpdateKybStatusDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(KybStatusActions)
  action: KybStatusActions;

  @IsOptional()
  @IsString()
  reason: string;
}

export class ProfileDto {
  constructor(partial: any) {
    Object.assign(this, partial);
  }

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;
}

export class PrimaryUserDto {
  constructor(partial: any) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  email: string;

  @ValidateNested()
  @Type(() => ProfileDto)
  @Expose()
  profile?: ProfileDto;
}

export class GetCompanyResponseDTO {
  constructor(partial: any) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  rcNumber: string;

  @Expose()
  isVerified: boolean;

  @Expose()
  kybStatus: string;

  @Expose()
  isActive: boolean;

  @Expose()
  status: string;

  @Type(() => Map)
  @Expose()
  kybData: Map<string, any>;

  @Expose()
  type: CompanyTypes;

  @Expose()
  subtype: string;

  @Expose()
  tier: string;

  @Expose()
  createdAt: Date;

  @ValidateNested()
  @Type(() => PrimaryUserDto)
  @Expose()
  primaryUser: PrimaryUserDto;
}

export class GetCompanySubTypesResponseDTO {
  constructor(partial: Partial<CompanySubtypes>) {
    Object.assign(this, partial);
  }

  @Expose()
  [CompanyTypes.INDIVIDUAL]: string[];

  @Expose()
  [CompanyTypes.LICENSED_ENTITY]: string[];

  @Expose()
  [CompanyTypes.BUSINESS]: string[];
}

export class GetCompanyCustomFieldsResponseDTO {
  constructor(
    partial: Partial<Record<string, { type: string; label: string }>>,
  ) {
    Object.assign(this, partial);
  }
}

export class GetCompanyTypesResponseDTO {
  constructor(
    partial: Partial<{
      companyTypes: string[];
      companySubtypes: CompanySubtypes;
    }>,
  ) {
    Object.assign(this, partial);
  }

  @Expose()
  companyTypes: string[];

  @Expose()
  companySubtypes: GetCompanySubTypesResponseDTO;
}
export class UpdateCompanyKybStatusResponseDTO {
  constructor(
    partial: Partial<{
      tier: string;
    }>,
  ) {
    Object.assign(this, partial);
  }

  @Expose()
  tier: string;
}

export class GetStatsResponseDTO {
  constructor(partial: GetStatsResponseDTO) {
    Object.assign(this, partial);
  }

  @Expose()
  count: number;

  @Expose()
  value: string;

  @Expose()
  @IsObject()
  @ValidateNested()
  @Type(() => GetStatsResponseDTO)
  data?: GetStatsResponseDTO;
}

class GetStatsFilterCreatedAtDto {
  @IsDateString()
  @IsOptional()
  'gt': string;

  @IsDateString()
  @IsOptional()
  'lt': string;
}

export class GetStatsFilterDto {
  @IsObject()
  @ValidateNested()
  @Type(() => GetStatsFilterCreatedAtDto)
  'createdAt': GetStatsFilterCreatedAtDto;
}

export class GetStatsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => GetStatsFilterDto)
  filter: GetStatsFilterDto;
}
