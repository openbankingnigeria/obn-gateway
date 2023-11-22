const BASE_URL = 'http://3.134.253.153:4000';

// AUTH
export const postSignup = () => `${BASE_URL}/auth/signup`;
export const postLogin = () => `${BASE_URL}/auth/login`;
export const postInitiatePasswordReset = () => `${BASE_URL}/auth/password/forgot`;
export const postResetPassword = ({ resetToken }: {resetToken: string}) => 
  `${BASE_URL}/auth/password/reset/${resetToken}`;
export const postAccountSetUp = ({ setupToken }: {setupToken: string}) => 
  `${BASE_URL}/auth/setup/${setupToken}`;

// TEAMS AND ROLES
export const getRoles = () => `${BASE_URL}/roles`;
export const postRoles = () => `${BASE_URL}/roles`;
export const putRolePermission = ({ role_id }: { role_id: string }) => 
  `${BASE_URL}/roles/${role_id}/permissions`;