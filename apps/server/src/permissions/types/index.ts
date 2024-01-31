export enum PERMISSIONS {
  LIST_API_CONSUMERS = 'list-api-consumers',
  VIEW_API_CONSUMER = 'view-api-consumer',
  UPDATE_API_CONSUMER = 'update-api-consumer',
  ACTIVATE_API_CONSUMER = 'activate-api-consumer',
  DEACTIVATE_API_CONSUMER = 'deactivate-api-consumer',

  LIST_API_CALLS = 'list-api-calls',
  VIEW_API_CALL = 'view-api-call',

  LIST_API_ACTIVITIES = 'list-api-activities',

  LIST_CONSENTS = 'list-consents',
  VIEW_CONSENT = 'view-consent',

  LIST_REPORTS = 'list-reports',
  VIEW_REPORT = 'view-report',

  ADD_TEAM_MEMBERS = 'add-team-member',
  LIST_TEAM_MEMBERS = 'list-team-members',
  UPDATE_TEAM_MEMBER = 'update-team-member',
  ACTIVATE_TEAM_MEMBER = 'activate-team-member',
  DEACTIVATE_TEAM_MEMBER = 'deactivate-team-member',

  CREATE_ROLE = 'create-role',
  LIST_ROLES = 'list-roles',
  UPDATE_ROLE = 'update-role',
  ACTIVATE_ROLE = 'activate-role',
  DEACTIVATE_ROLE = 'deactivate-role',
  DELETE_ROLE = 'delete-role',

  LIST_SYSTEM_SETTINGS = 'list-system-settings',
  VIEW_SYSTEM_SETTING = 'view-system-setting',
  UPDATE_SYSTEM_SETTING = 'update-system-setting',

  LIST_AUDIT_LOGS = 'list-audit-logs',
  VIEW_AUDIT_LOG = 'view-audit',

  LIST_API_COLLECTIONS = 'list-api-collections',
  CREATE_API_COLLECTION = 'create-api-collection',
  VIEW_API_COLLECTION = 'view-api-collection',
  DELETE_API_COLLECTION = 'delete-api-collection',
  UPDATE_API_COLLECTION = 'update-api-collection',
  VIEW_TEAM_MEMBER = 'view-team-member',
  DELETE_TEAM_MEMBER = 'delete-team-member',

  UPDATE_COMPANY_KYB_DETAILS = 'update-company-kyb-details',
  UPDATE_COMPANY_KYB_STATUS = 'update-company-kyb-status',
  UPDATE_COMPANY_ACCESS = 'update-company-access',
  UPDATE_COMPANY_DETAILS = 'update-company-details',
  LIST_COMPANIES = 'list-companies',
  VIEW_COMPANY = 'view-company',

  UPDATE_KYB_REQUIREMENT_SETTINGS = 'update-kyb-requirement-setting',
  UPDATE_KYB_REQUIREMENTS = 'update-kyb-requirements',
  VIEW_KYB_REQUIREMENTS = 'view-kyb-requirements',

  ADD_API_ENDPOINT = 'add-api-endpoint',
  VIEW_API_ENDPOINT = 'view-api-endpoint',
  LIST_API_ENDPOINTS = 'list-api-endpoints',
  ASSIGN_API_ENDPOINTS = 'assign-api-endpoints',
  DELETE_API_ENDPOINT = 'delete-api-endpoint',
  UPDATE_API_ENDPOINT = 'update-api-endpoint',
  VIEW_API_TRANSFORMATION = 'view-api-transformation',
  SET_API_TRANSFORMATION = 'set-api-transformation',

  SET_API_RESTRICTIONS = 'set-api-restrictions',
  VIEW_API_RESTRICTIONS = 'view-api-restrictions',

  RESET_API_KEY = 'reset-api-key',
  VIEW_API_KEY = 'view-api-key',

  UPDATE_COMPANY_TYPES = 'update-company-types',
}

export enum PROVIDER_PERMISSIONS {
  LIST_API_CONSUMERS = 'list-api-consumers',
  VIEW_API_CONSUMER = 'view-api-consumer',
  APPROVE_API_CONSUMER = 'approve-api-consumer',
  DECLINE_API_CONSUMER = 'decline-api-consumer',
  ACTIVATE_API_CONSUMER = 'activate-api-consumer',
  DEACTIVATE_API_CONSUMER = 'deactivate-api-consumer',

  LIST_API_CALLS = 'list-api-calls',
  VIEW_API_CALL = 'view-api-call',

  LIST_CONSENTS = 'list-consents',
  VIEW_CONSENT = 'view-consent',

  LIST_REPORTS = 'list-reports',
  VIEW_REPORT = 'view-report',

  ADD_TEAM_MEMBERS = 'add-team-member',
  LIST_TEAM_MEMBERS = 'list-team-members',
  UPDATE_TEAM_MEMBER = 'update-team-member',
  ACTIVATE_TEAM_MEMBER = 'activate-team-member',
  DEACTIVATE_TEAM_MEMBER = 'deactivate-team-member',
  VIEW_TEAM_MEMBER = 'view-team-member',
  DELETE_TEAM_MEMBER = 'delete-team-member',

  CREATE_ROLE = 'create-role',
  LIST_ROLES = 'list-roles',
  UPDATE_ROLE = 'update-role',
  ACTIVATE_ROLE = 'activate-role',
  DEACTIVATE_ROLE = 'deactivate-role',
  VIEW_ROLE = 'view-role',
  DELETE_ROLE = 'delete-role',

  LIST_SYSTEM_SETTINGS = 'list-system-settings',
  VIEW_SYSTEM_SETTING = 'view-system-setting',
  UPDATE_SYSTEM_SETTING = 'update-system-setting',

  LIST_AUDIT_LOGS = 'list-audit-logs',

  LIST_API_COLLECTIONS = 'list-api-collections',
  CREATE_API_COLLECTIONS = 'create-api-collections',
  UPDATE_API_COLLECTIONS = 'update-api-collections',
  VIEW_COLLECTIONS = 'view-api-collections',
  DELETE_COLLECTIONS = 'delete-api-collections',

  UPDATE_KYB_REQUIREMENT_SETTINGS = 'update-kyb-requirement-setting',
  UPDATE_KYB_REQUIREMENTS = 'update-kyb-requirements',
}

export enum CONSUMER_PERMISSIONS {
  LIST_API_ACTIVITIES = 'list-api-activities',
  VIEW_API_ACTIVITIES = 'View-api-activities',
  LIST_CONSENTS = 'list-consents',
  VIEW_CONSENT = 'view-consent',
  LIST_REPORTS = 'list-reports',
  VIEW_REPORT = 'view-report',
  ADD_TEAM_MEMBERS = 'add-team-member',
  LIST_TEAM_MEMBERS = 'list-team-members',
  UPDATE_TEAM_MEMBER = 'update-team-member',
  ACTIVATE_TEAM_MEMBER = 'activate-team-member',
  DEACTIVATE_TEAM_MEMBER = 'deactivate-team-member',
  VIEW_TEAM_MEMBER = 'view-team-member',
  CREATE_ROLE = 'create-role',
  LIST_ROLES = 'list-roles',
  UPDATE_ROLE = 'update-role',
  ACTIVATE_ROLE = 'activate-role',
  DEACTIVATE_ROLE = 'deactivate-role',
  VIEW_ROLE = 'view-role',
  DELETE_ROLE = 'delete-role',
  LIST_SYSTEM_SETTINGS = 'list-system-settings',
  VIEW_SYSTEM_SETTING = 'view-system-setting',
  UPDATE_SYSTEM_SETTING = 'update-system-setting',
  LIST_AUDIT_LOGS = 'list-audit-logs',
  LIST_API_COLLECTIONS = 'list-api-collection',
  VIEW_API_COLLECTIONS = 'View-api-collection',
  UPDATE_COMPANY_KYB_DETAILS = 'update-company-kyb-details',
  UPDATE_COMPANY_DETAILS = 'update-company-details',
}
