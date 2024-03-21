export const PROVIDER_PERMISSIONS = {
  LIST_API_CONSUMERS: 'list-api-consumers',
  VIEW_API_CONSUMER: 'view-api-consumer',
  APPROVE_API_CONSUMER: 'approve-api-consumer',
  DECLINE_API_CONSUMER: 'decline-api-consumer',
  ACTIVATE_API_CONSUMER: 'activate-api-consumer',
  DEACTIVATE_API_CONSUMER: 'deactivate-api-consumer',

  LIST_API_CALLS: 'list-api-calls',
  VIEW_API_CALL: 'view-api-call',

  LIST_CONSENTS: 'list-consents',
  VIEW_CONSENT: 'view-consent',

  LIST_REPORTS: 'list-reports',
  VIEW_REPORT: 'view-report',

  ADD_TEAM_MEMBERS: 'add-team-member',
  LIST_TEAM_MEMBERS: 'list-team-members',
  UPDATE_TEAM_MEMBER: 'update-team-member',
  ACTIVATE_TEAM_MEMBER: 'activate-team-member',
  DEACTIVATE_TEAM_MEMBER: 'deactivate-team-member',
  VIEW_TEAM_MEMBER: 'view-team-member',
  DELETE_TEAM_MEMBER: 'delete-team-member',

  CREATE_ROLE: 'create-role',
  LIST_ROLES: 'list-roles',
  UPDATE_ROLE: 'update-role',
  ACTIVATE_ROLE: 'activate-role',
  DEACTIVATE_ROLE: 'deactivate-role',
  VIEW_ROLE: 'view-role',
  DELETE_ROLE: 'delete-role',

  LIST_SYSTEM_SETTINGS: 'list-system-settings',
  VIEW_SYSTEM_SETTING: 'view-system-setting',
  UPDATE_SYSTEM_SETTING: 'update-system-setting',

  LIST_AUDIT_LOGS: 'list-audit-logs',
  VIEW_AUDIT_LOG: 'view-audit',

  LIST_API_COLLECTIONS: 'list-api-collections',
  CREATE_API_COLLECTION: 'create-api-collection',
  VIEW_API_COLLECTION: 'view-api-collection',
  DELETE_API_COLLECTION: 'delete-api-collection',
  UPDATE_API_COLLECTION: 'update-api-collection',

  UPDATE_KYB_REQUIREMENT_SETTINGS: 'update-kyb-requirement-setting',
  UPDATE_KYB_REQUIREMENTS: 'update-kyb-requirements',
  VIEW_KYB_REQUIREMENTS: 'view-kyb-requirements',

  AP_VIEW_ASSIGNED_API_ENDPOINTS: 'ap-view-assigned-api-endpoints',

  SET_API_RESTRICTIONS: 'set-api-ip-restrictions',
  VIEW_API_RESTRICTIONS: 'view-api-ip-restrictions',

  RESET_API_KEY: 'reset-api-key',
  VIEW_API_KEY: 'view-api-key',

  ASSIGN_API_ENDPOINTS: 'assign-api-endpoints',
  DELETE_API_ENDPOINT: 'delete-api-endpoint',
  UPDATE_API_ENDPOINT: 'update-api-endpoint',
  VIEW_API_TRANSFORMATION: 'view-api-transformation',
  SET_API_TRANSFORMATION: 'set-api-transformation',

  ADD_API_ENDPOINT: 'add-api-endpoint',
  VIEW_API_ENDPOINT: 'view-api-endpoint',
  LIST_API_ENDPOINTS: 'list-api-endpoints',
  VIEW_ASSIGNED_API_ENDPOINTS: 'view-assigned-api-endpoints',

  UPDATE_COMPANY_TYPES: 'update-company-types',

  LIST_COMPANIES: 'list-companies',
  VIEW_COMPANY: 'view-company',
  UPDATE_COMPANY_KYB_DETAILS: 'update-company-kyb-details',
  UPDATE_COMPANY_KYB_STATUS: 'update-company-kyb-status',
  UPDATE_COMPANY_ACCESS: 'update-company-access',
  UPDATE_COMPANY_DETAILS: 'update-company-details',

  VIEW_PROFILE: 'view-profile',
  UPDATE_PROFILE: 'update-profile',
  ENABLE_TWOFA: 'enable-twofa',
  DISABLE_TWOFA: 'disable-twofa',
  CHANGE_PASSWORD: 'change-password',

  VIEW_COMPANY_DETAILS: 'view-company-details',
};

export const CONSUMER_PERMISSIONS = {
  LIST_API_ACTIVITIES: 'list-api-activities',
  VIEW_API_ACTIVITIES: 'view-api-activities',
  LIST_CONSENTS: 'list-consents',
  VIEW_CONSENT: 'view-consent',
  LIST_REPORTS: 'list-reports',
  VIEW_REPORT: 'view-report',
  ADD_TEAM_MEMBERS: 'add-team-member',
  LIST_TEAM_MEMBERS: 'list-team-members',
  UPDATE_TEAM_MEMBER: 'update-team-member',
  ACTIVATE_TEAM_MEMBER: 'activate-team-member',
  DEACTIVATE_TEAM_MEMBER: 'deactivate-team-member',
  VIEW_TEAM_MEMBER: 'view-team-member',
  CREATE_ROLE: 'create-role',
  LIST_ROLES: 'list-roles',
  UPDATE_ROLE: 'update-role',
  ACTIVATE_ROLE: 'activate-role',
  DEACTIVATE_ROLE: 'deactivate-role',
  VIEW_ROLE: 'view-role',
  DELETE_ROLE: 'delete-role',
  LIST_AUDIT_LOGS: 'list-audit-logs',
  VIEW_AUDIT_LOG: 'view-audit',

  LIST_API_COLLECTIONS: 'list-api-collections',
  VIEW_API_COLLECTIONS: 'view-api-collection',
  UPDATE_COMPANY_KYB_DETAILS: 'update-company-kyb-details',
  UPDATE_COMPANY_DETAILS: 'update-company-details',
  VIEW_COMPANY_DETAILS: 'view-company-details',
  VIEW_ASSIGNED_API_ENDPOINTS: 'view-assigned-api-endpoints',
  VIEW_API_ENDPOINT: 'view-api-endpoint',

  SET_API_RESTRICTIONS: 'set-api-ip-restrictions',
  VIEW_API_RESTRICTIONS: 'view-api-ip-restrictions',

  RESET_API_KEY: 'reset-api-key',
  VIEW_API_KEY: 'view-api-key',

  VIEW_KYB_REQUIREMENTS: 'view-kyb-requirements',

  VIEW_PROFILE: 'view-profile',
  UPDATE_PROFILE: 'update-profile',
  ENABLE_TWOFA: 'enable-twofa',
  DISABLE_TWOFA: 'disable-twofa',
  CHANGE_PASSWORD: 'change-password',

  LIST_API_CALLS: 'list-api-calls',
  VIEW_API_CALL: 'view-api-call',
};

export const PERMISSIONS = {
  ...PROVIDER_PERMISSIONS,
  ...CONSUMER_PERMISSIONS,
};
