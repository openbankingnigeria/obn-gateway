import { settingsErrors } from '@settings/settings.errors';
import {
  EmailSettingsInterface,
  SETTINGS_TYPES,
  UserAgreementSettingsInterface,
} from '../types';
import {
  GeneralSettingsInterface,
  KybDataTypes,
  BusinessSettings,
} from '@settings/types';
import { Expose, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { CompanyTypes } from '@common/database/constants';

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

export class UpdateCompanySubtypesRequest {
  @IsOptional()
  @IsString({ each: true })
  [CompanyTypes.INDIVIDUAL]: string[];

  @IsOptional()
  @IsString({ each: true })
  [CompanyTypes.BUSINESS]: string[];

  @IsOptional()
  @IsString({ each: true })
  [CompanyTypes.LICENSED_ENTITY]: string[];
}

export class KybRequirementsResponse {
  constructor(partial: Partial<BusinessSettings['kybRequirements'][0]>) {
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
  // TODO add CIDR check
  // @IsIP(undefined, { each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
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

export class GeneralSettingsUpdateDto
  implements Record<keyof GeneralSettingsInterface, string>
{
  @IsOptional()
  @IsString()
  authTokenExpirationDuration: string;

  @IsOptional()
  @IsString()
  failedLoginAttempts: string;

  @IsOptional()
  @IsString()
  inactivityTimeout: string;

  @IsOptional()
  @IsString()
  invitationTokenExpirationDuration: string;

  @IsOptional()
  @IsString()
  passwordResetTokenExpirationDuration: string;

  @IsOptional()
  @IsString()
  requestTimeout: string;

  @IsOptional()
  @IsString()
  twoFaExpirationDuration: string;
}

export class UserAgreementUpdateDto
  implements Record<keyof UserAgreementSettingsInterface, string>
{
  @IsOptional()
  @IsString()
  @IsUrl()
  privacyPolicy: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  termsAndConditions: string;
}

export class EmailSettingsUpdateDto
  implements Record<keyof EmailSettingsInterface, string>
{
  @IsOptional()
  @IsString()
  emailHost: string;

  @IsOptional()
  @IsString()
  emailBaseUrl: string;

  @IsOptional()
  @IsString()
  emailPort: string;

  @IsOptional()
  @IsString()
  emailUser: string;

  @IsOptional()
  @IsString()
  emailPassword: string;

  @IsOptional()
  @IsString()
  emailFrom: string;

  @IsOptional()
  @IsString()
  emailSecure: string;
}

export class EmailTemplateDto {
  @IsNotEmpty()
  @IsString()
  temmplateId: string;

  @IsOptional()
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  title: string;
}

export const SettingsUpdateDtos: Record<SETTINGS_TYPES, any> = {
  email_settings: EmailSettingsUpdateDto,
  email_templates: EmailTemplateDto,
  external_services: null,
  mock_services: null,
  general: GeneralSettingsUpdateDto,
  onboarding_custom_fields: null,
  user_agreements: UserAgreementUpdateDto,
};
