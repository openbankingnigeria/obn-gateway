export enum AllEvents {
  // API events
  DELETE_APIS = 'apis.delete',
  CREATE_APIS = 'apis.create',
  UPDATE_APIS = 'apis.update',
  SET_TRANSFORMATION = 'apis.transformation.set',
  ASSIGN_APIS = 'apis.assign',
  UNASSIGN_APIS = 'apis.unassign',
  VIEW_API_LOGS = 'apis.logs.view',
  VIEW_API_LOG_STATS = 'apis.log-stats.view',
  GET_TRANSFORMATION = 'apis.transformation.view',
  VIEW_COMPANY_APIS = 'apis.company.view',
  //   Auth Events
  SIGN_UP = 'auth.signup',
  LOGIN = 'auth.login',
  SET_PASSWORD = 'auth.set-password',
  RESET_PASSWORD_REQUEST = 'auth.reset-password-request',
  RESET_PASSWORD = 'auth.reset-password',
  //   Collection Events
  CREATE_COLLECTIONS = 'collections.create',
  UPDATE_COLLECTIONS = 'collections.update',
  VIEW_COLLECTIONS = 'collections.view',
  VIEW_COMPANY_COLLECTIONS = 'collections.company.view',
  DELETE_COLLECTIONS = 'collections.delete',
  //   Company Events
  COMPANY_KYB_APPROVED = 'company.kyb.approved',
  COMPANY_KYB_DENIED = 'company.kyb.denied',
  //   Profile Events
  UPDATE_PROFILE = 'profile.update',
  GENERATE_2FA = 'profile.2fa.generate',
  VERIFY_2FA = 'profile.2fa.verify',
  DISABLE_2FA = 'profile.2fa.disable',
  //   Role Events
  CREATE_ROLE = 'role.create',
  UPDATE_ROLE = 'role.update',
  DELETE_ROLE = 'role.delete',
  SET_ROLE_PERMISSIONS = 'role.permissions.update',
  GET_ROLE_PERMISSIONS = 'role.permissions.view',
  GET_PERMISSIONS = 'permissions.view',
  LIST_ROLE = 'role.view',
  GET_STATS = 'role.stats.view',
  //   Settings Events
  UPDATE_KYB_REQUIREMENTS = 'settings.kyb.update',
  UPDATE_COMPANY_SUBTYPES = 'settings.company_types.update',
  GENERATE_API_KEY = 'settings.api.key.create',
  SET_IP_RESTRICTIOIN = 'settings.api.restriction.create',
  GET_API_KEY = 'settings.api.key.view',
  EDIT_SETTINGS = 'settings.update',
  SET_CLIENT_EVENT = 'settings.api.client.create',
  //   User events
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_DEACTIVATED = 'user.deactivated',
  USER_REACTIVATED = 'user.reactivated',
}