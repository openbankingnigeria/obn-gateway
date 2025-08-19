import { Profile } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class ProfileBuilder extends EntityBuilder<Profile> {
  constructor() {
    super({
      firstName: 'Test',
      lastName: 'User',
      companyRole: 'Developer',
      userId: 'test-user-id',
    });
  }

  protected validate(): boolean {
    return !!this.instance.firstName && !!this.instance.lastName && !!this.instance.userId;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}