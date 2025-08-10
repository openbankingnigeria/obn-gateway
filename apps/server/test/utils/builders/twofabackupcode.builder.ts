import { TwoFaBackupCode } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class TwoFaBackupCodeBuilder extends EntityBuilder<TwoFaBackupCode> {
  constructor() {
    super({
      value: '123456',
      userId: 'test-user-id',
    });
  }

  protected validate(): boolean {
    return !!this.instance.value && !!this.instance.userId;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}