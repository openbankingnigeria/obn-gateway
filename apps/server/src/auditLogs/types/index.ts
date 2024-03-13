import { UserStatuses } from '@common/database/entities';

export interface AuditLogEventPayload {
  event: string;
  metadata: unknown;
  userId: string;
  companyId: string;
}

export interface UserEventDetails {
  profile: string;
  id: string;
  email: string;
  status: UserStatuses;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
  roleName: string;
}
