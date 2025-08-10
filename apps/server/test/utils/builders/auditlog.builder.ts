import { AuditLog } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class AuditLogBuilder extends EntityBuilder<AuditLog> {
  constructor() {
    super({
      event: 'test.event',
      companyId: 'test-company-id',
      userId: 'test-user-id',
    });
  }

  protected validate(): boolean {
    return !!this.instance.event && !!this.instance.companyId && !!this.instance.userId;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}