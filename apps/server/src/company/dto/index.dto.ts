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
  createdAt: Date;
}
