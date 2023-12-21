import {
  IsAlphanumeric,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  // Length,
} from 'class-validator';
import { companyValidationErrors } from '../company.config';
import { Company } from '@common/database/entities';
import { CompanyTypes } from '@common/database/constants';
import { Expose } from 'class-transformer';
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

export class GetCompanyResponseDTO {
  constructor(partial: Partial<Company>) {
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
  isActive: boolean;

  @Expose()
  kybData: string;

  @Expose()
  type: CompanyTypes;

  @Expose()
  subtype: string;

  @Expose()
  tier: string;

  @Expose()
  createdAt: Date;
}

export class GetCompanySubTypesResponseDTO {
  constructor(partial: Partial<CompanySubtypes>) {
    Object.assign(this, partial);
  }

  @Expose()
  individual: string[];

  @Expose()
  licensedEntity: string[];

  @Expose()
  business: string[];
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
