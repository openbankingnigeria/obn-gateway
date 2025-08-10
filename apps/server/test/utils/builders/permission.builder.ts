import { Permission } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class PermissionBuilder extends EntityBuilder<Permission> {
  constructor() {
    super({
      name: 'Test Permission',
      slug: 'test-permission',
      description: 'Test permission description',
    });
  }

  protected validate(): boolean {
    return !!this.instance.name && !!this.instance.slug;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}