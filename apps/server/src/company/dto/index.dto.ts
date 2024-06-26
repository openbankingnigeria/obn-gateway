import {
  IsAlphanumeric,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateNested,
  // Length,
} from 'class-validator';
import { companyValidationErrors } from '../company.config';
import { CompanyTypes } from '@common/database/constants';
import { Expose, Type } from 'class-transformer';
import { CompanySubtypes } from 'src/settings/types';
import { authValidationErrors } from '@auth/auth.config';

export enum KybStatusActions {
  APPROVE = 'approve',
  DENY = 'deny',
}

export class UpdateCompanyDetailsDto {
  @IsOptional()
  @IsAlphanumeric('en-US', {
    message: ({ property }) =>
      companyValidationErrors.dto.typeMismatch(
        property,
        'alphabets and numbers',
      ),
  })
  @Length(15, 15, { message: 'rcNumber must be exactly 15 digits long.' })
  rcNumber: string;

  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/\d/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'numbers'),
  })
  accountNumber: string;
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
  constructor(partial: Partial<ProfileDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phone?: string;
}

export class PrimaryUserDto {
  constructor(partial: Partial<PrimaryUserDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  bvn?: string;

  @ValidateNested()
  @Type(() => ProfileDto)
  @Expose()
  profile?: ProfileDto;
}

export class GetCompanyResponseDTO {
  constructor(partial: Partial<GetCompanyResponseDTO>) {
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

export class GetCompanyKYBDataResponseDTO extends GetCompanyResponseDTO {
  constructor(
    partial: Partial<GetCompanyResponseDTO & GetCompanyKYBDataResponseDTO>,
  ) {
    super(partial);
    Object.assign(this, partial);
  }

  @Type(() => Map)
  @Expose()
  kybData: Map<string, any>;
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
