import { User, UserStatuses } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class UserBuilder extends EntityBuilder<User> {
  constructor(defaults: Partial<User> = {}) {
    super({
      email: 'test@example.com',
      twofaEnabled: false,
      emailVerified: false,
      status: UserStatuses.PENDING,
      ...defaults
    });
  }

  withPartial(partial: Partial<User>): this {
    Object.entries(partial).forEach(([key, value]) => {
      this.with(key as keyof User, value);
    });
    return this;
  }

  protected validate(): boolean {
    return !!this.instance.email;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}