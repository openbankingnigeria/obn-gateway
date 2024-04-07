import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum AuditLogsEvents {
  VIEW_AUDIT_LOGS = 'logs.view',
}

export class AuditLogEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class ViewAuditLogs extends AuditLogEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(AuditLogsEvents.VIEW_AUDIT_LOGS, author, metadata);
  }
}
