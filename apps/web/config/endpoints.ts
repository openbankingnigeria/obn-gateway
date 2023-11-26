const BASE_URL = 'http://3.134.253.153:4000';

// AUTH
export const postSignup = () => `${BASE_URL}/auth/signup`;
export const postLogin = () => `${BASE_URL}/auth/login`;
export const postInitiatePasswordReset = () => `${BASE_URL}/auth/password/forgot`;
export const postResetPassword = ({ resetToken }: {resetToken: string}) => 
  `${BASE_URL}/auth/password/reset/${resetToken}`;
export const postAccountSetUp = ({ setupToken }: {setupToken: string}) => 
  `${BASE_URL}/auth/setup/${setupToken}`;

// ROLES
export const getRolePermission = ({ role_id }: { role_id: string }) => 
  `${BASE_URL}/roles/${role_id}/permissions`
export const getPermissions = () => `${BASE_URL}/roles/permissions`
export const getRoles = () => `${BASE_URL}/roles`;
export const postRole = () => `${BASE_URL}/roles`;
export const updateRole = ({ role_id }: { role_id: string }) => 
  `${BASE_URL}/roles/${role_id}`
export const putRolePermission = ({ role_id }: { role_id: string }) => 
  `${BASE_URL}/roles/${role_id}/permissions`;

// TEAMS
export const postTeam = () => `${BASE_URL}/users`;
export const getTeams = () => `${BASE_URL}/users`;
export const updateTeam = ({ member_id }: { member_id: string }) => 
  `${BASE_URL}/users/${member_id}`;
export const getTeam = ({ member_id }: { member_id: string }) => 
  `${BASE_URL}/users/${member_id}`;