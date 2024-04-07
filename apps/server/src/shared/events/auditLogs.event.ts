import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum AuditLogsEvents {}

export class AuditLogEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}
