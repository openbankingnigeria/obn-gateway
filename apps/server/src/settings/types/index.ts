import { CompanyTypes } from '@common/database/constants';

export enum KybDataTypes {
  FILE = 'file',
  STRING = 'string',
}

export type CompanySubtypes = Record<
  | CompanyTypes.INDIVIDUAL
  | CompanyTypes.LICENSED_ENTITY
  | CompanyTypes.BUSINESS,
  string[]
>;

export interface BusinessSettings {
  uneditableFields: string[];
  kybRequirements: {
    name: string;
    label: string;
    type: string;
    editable: boolean;
    length?: number;
  }[];
  companySubtypes: CompanySubtypes;
}

interface SettingsBase<T = number | string | boolean> {
  value: T;
}

export interface SingleGeneralSetting extends SettingsBase {
  type: 'time' | 'count';
  unit?: 'secs' | 'mins';
}

export interface GeneralSettingsInterface {
  inactivityTimeout: SingleGeneralSetting;
  requestTimeout: SingleGeneralSetting;
  authTokenExpirationDuration: SingleGeneralSetting;
  passwordResetTokenExpirationDuration: SingleGeneralSetting;
  twoFaExpirationDuration: SingleGeneralSetting;
  invitationTokenExpirationDuration: SingleGeneralSetting;
  failedLoginAttempts: SingleGeneralSetting;
}

export interface GeneralSettingsInterface {
  inactivityTimeout: SingleGeneralSetting;
  requestTimeout: SingleGeneralSetting;
  authTokenExpirationDuration: SingleGeneralSetting;
  passwordResetTokenExpirationDuration: SingleGeneralSetting;
  twoFaExpirationDuration: SingleGeneralSetting;
  invitationTokenExpirationDuration: SingleGeneralSetting;
  failedLoginAttempts: SingleGeneralSetting;
}

export interface EmailSettingsInterface {
  emailHost: SettingsBase<string>;
  emailUser: SettingsBase<string>;
  emailFrom: SettingsBase<string>;
  emailPort: SettingsBase<string>;
  emailSecure: SettingsBase<boolean>;
  emailPassword: SettingsBase<string>;
  emailBaseUrl: SettingsBase<string>;
}

export interface UserAgreementSettingsInterface {
  privacyPolicy: SettingsBase<string>;
  termsAndConditions: SettingsBase<string>;
}

export interface AdditionalOnboardingCustomFieldsInterface {
  business: Record<
    string,
    { label: string; type: 'email' | 'password' | 'text' | 'dropdown' }
  >;
  individual: Record<
    string,
    { label: string; type: 'email' | 'password' | 'text' | 'dropdown' }
  >;
  ['licensed-entity']: Record<
    string,
    { label: string; type: 'email' | 'password' | 'text' | 'dropdown' }
  >;
}

export enum SETTINGS_TYPES {
  GENERAL_SETTINGS = 'general',
  EMAIL_SETTINGS = 'email_settings',
  EMAIL_TEMPLATES = 'email_templates',
  EXTERNAL_SERVICES = 'external_services',
  MOCK_SERVICES = 'mock_services',
  USER_AGREEMENTS = 'user_agreements',
  ONBOARDING_CUSTOM_FIELDS = 'onboarding_custom_fields',
}

export enum EMAIL_PROVIDERS {
  SENDGRID = 'sendgrid',
}
