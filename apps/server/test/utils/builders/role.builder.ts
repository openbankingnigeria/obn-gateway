import { Role, RoleStatuses } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class RoleBuilder extends EntityBuilder<Role> {
  constructor() {
    super({
      name: 'Test Role',
      slug: 'test-role',
      description: 'Test role description',
      status: RoleStatuses.ACTIVE,
    });
  }

  protected validate(): boolean {
    return !!this.instance.name && !!this.instance.slug;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}