import { GetListProps, GetSingleProps, PostTokenProps, 
} from "@/types/endpointTypes";

const BASE_URL = 'http://3.134.253.153:4000';


// AUTH
export const postSignup = () => `${BASE_URL}/auth/signup`;
export const postLoginWith2FA = () => `${BASE_URL}/auth/login/two-fa`;
export const postLogin = () => `${BASE_URL}/auth/login`;
export const postInitiatePasswordReset = () => `${BASE_URL}/auth/password/forgot`;
export const postResetPassword = ({ token }: PostTokenProps) => 
  `${BASE_URL}/auth/password/reset/${token}`;
export const postAccountSetUp = ({ token }: PostTokenProps) => 
  `${BASE_URL}/auth/setup/${token}`;


// ROLES
export const getRolePermission = ({ id }: GetSingleProps) => 
  `${BASE_URL}/roles/${id}/permissions`
export const getPermissions = () => `${BASE_URL}/roles/permissions`
export const getRoles = ({ page, limit, name, status }: GetListProps) => 
  `${BASE_URL}/roles?page=${page}${limit ? `&limit=${limit}`: ''}${status ? `&filter[status]=${status}`: ''}${name ? `&filter[name]=${name}`: ''}`;
export const postRole = () => `${BASE_URL}/roles`;
export const updateRole = ({ id }: GetSingleProps) => 
  `${BASE_URL}/roles/${id}`
export const putRolePermission = ({ id }: GetSingleProps) => 
  `${BASE_URL}/roles/${id}/permissions`;


// TEAMS
export const postTeam = () => `${BASE_URL}/users`;
export const getTeams = ({ page, limit, name, status, email, role }: GetListProps) => 
  `${BASE_URL}/users?page=${page}${limit ? `&limit=${limit}`: ''}${name ? `&filter[name]=${name}`: ''}${role ? `&filter[role]=${role}`: ''}${email ? `&filter[email]=${email}`: ''}${status ? `&filter[status]=${status}`: ''}`;
export const updateTeam = ({ id }: GetSingleProps) => 
  `${BASE_URL}/users/${id}`;
export const getTeam = ({ id }: GetSingleProps) => 
  `${BASE_URL}/users/${id}`;

  
// PROFILE
export const getProfile = () => `${BASE_URL}/profile`;
export const updateProfile = () => `${BASE_URL}/profile`;
export const updatePassword = () => `${BASE_URL}/profile/password`;
export const postSetup2FA = () => `${BASE_URL}/profile/two-fa`;
export const verify2FA = () => `${BASE_URL}/profile/two-fa`;
export const disable2FA = () => `${BASE_URL}/profile/two-fa/disable`;


// AUDIT TRAIL
export const getAuditLog = ({ id }: GetSingleProps) => 
  `${BASE_URL}/audit-trail/${id}`;
export const getAuditTrails = ({ page, limit, event, createdAt_gt, createdAt_l, name }: GetListProps) => 
  `${BASE_URL}/audit-trail?page=${page}${limit ? `&limit=${limit}`: ''}${event ? `&filter[event]=${event}`: ''}${createdAt_gt ? `&filter[createdAt][gte]=${createdAt_gt}`: ''}${createdAt_l ? `&filter[createdAt][lte]=${createdAt_l}`: ''}${name ? `&filter[name]=${name}`: ''}`


// COLLECTIONS
export const getCollections = () => 
  `${BASE_URL}/collections`;
export const getCollection = ({ id }: GetSingleProps) => 
  `${BASE_URL}/collections/${id}`;
export const getAPIEndpoints = ({ id }: GetSingleProps) => 
  `${BASE_URL}/collections/${id}/apis`;