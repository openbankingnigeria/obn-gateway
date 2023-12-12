export enum CompanyTypes {
  BANK = 'Bank',
  BNPL = 'BNPL',
  LENDING = 'Lending',
  FINTECH = 'Fintech',
  INSURANCE = 'Insurance',
  OTHERS = 'Others',
  API_PROVIDER = 'API_PROVIDER',
}

export const CompanyTypesObject = {
  bank: 'BANK',
  apiProvider: 'API_PROVIDER',
};

export enum CompanyRoles {
  SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER',
  CEO = 'CEO',
  API_PROVIDER = 'API_PROVIDER',
}

export enum ROLES {
  API_PROVIDER = 'api-provider',
  API_CONSUMER = 'api-consumer',
  ADMIN = 'admin',
}

export enum EMAIL_TEMPLATES {
  USER_INVITE = 'user-invite',
  ACCESS_REQUEST = 'access-request',
  USER_DEACTIVATED = 'user-deactivated',
  USER_REACTIVATED = 'user-reactivated',
  SET_PASSWORD = 'set-password',
  RESET_PASSWORD_REQUEST = 'reset-password-request',
  RESET_PASSWORD = 'reset-password',
  COMPANY_KYB_APPROVED = 'company-kyb-approved',
  COMPANY_KYB_DENIED = 'company-kyb-denied',
  VERIFY_EMAIL = 'verify-email',
}
