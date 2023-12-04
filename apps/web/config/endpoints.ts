import { GetAuditLogProps, GetAuditTrailsProps, PostAccountSetUpProps, PostResetPasswordProps, 
  SingleMemberProps, SingleRoleProps 
} from "@/types/endpointTypes";

const BASE_URL = 'http://3.134.253.153:4000';


// AUTH
export const postSignup = () => `${BASE_URL}/auth/signup`;
export const postLogin = () => `${BASE_URL}/auth/login`;
export const postInitiatePasswordReset = () => `${BASE_URL}/auth/password/forgot`;
export const postResetPassword = ({ resetToken }: PostResetPasswordProps) => 
  `${BASE_URL}/auth/password/reset/${resetToken}`;
export const postAccountSetUp = ({ setupToken }: PostAccountSetUpProps) => 
  `${BASE_URL}/auth/setup/${setupToken}`;


// ROLES
export const getRolePermission = ({ role_id }: { role_id: string }) => 
  `${BASE_URL}/roles/${role_id}/permissions`
export const getPermissions = () => `${BASE_URL}/roles/permissions`
export const getRoles = () => `${BASE_URL}/roles`;
export const postRole = () => `${BASE_URL}/roles`;
export const updateRole = ({ role_id }: SingleRoleProps) => 
  `${BASE_URL}/roles/${role_id}`
export const putRolePermission = ({ role_id }: SingleRoleProps) => 
  `${BASE_URL}/roles/${role_id}/permissions`;


// TEAMS
export const postTeam = () => `${BASE_URL}/users`;
export const getTeams = () => `${BASE_URL}/users`;
export const updateTeam = ({ member_id }: SingleMemberProps) => 
  `${BASE_URL}/users/${member_id}`;
export const getTeam = ({ member_id }: SingleMemberProps) => 
  `${BASE_URL}/users/${member_id}`;

  
// PROFILE
export const getProfile = () => `${BASE_URL}/profile`;
export const updateProfile = () => `${BASE_URL}/profile`;
export const updatePassword = () => `${BASE_URL}/profile/password`;


// AUDIT TRAIL
export const getAuditLog = ({ logId }: GetAuditLogProps) => 
  `${BASE_URL}/audit-trail/${logId}`;
export const getAuditTrails = ({ page, limit, event, createdAt_gt, createdAt_l, name }: GetAuditTrailsProps) => 
  `${BASE_URL}/audit-trail?page=${page}${limit ? `&limit=${limit}`: ''}${event ? `&filter[event]=${event}`: ''}${createdAt_gt ? `&filter[createdAt][gt]=${createdAt_gt}`: ''}${createdAt_l ? `&filter[createdAt][l]=${createdAt_l}`: ''}${name ? `&filter[name]=${name}`: ''}`