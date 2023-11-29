export interface PostResetPasswordProps {
  resetToken: string
}

export interface PostAccountSetUpProps {
  setupToken: string;
}

export interface SingleRoleProps {
  role_id: string;
}

export interface SingleMemberProps {
  member_id: string;
} 

export interface GetAuditTrailsProps {
  page: string; 
  limit: string; 
  event?: string; 
  createdAt_gt?: string; 
  createdAt_l?: string; 
  name?: string; 
}

export interface GetAuditLogProps {
  logId: string;
}