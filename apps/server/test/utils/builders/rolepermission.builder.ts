import { RolePermission } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class RolePermissionBuilder extends EntityBuilder<RolePermission> {
  constructor() {
    super({
      roleId: 'default-role-id', 
      permissionId: 'default-permission-id'
    });
  }

  protected validate(): boolean {
    return !!this.instance.roleId && !!this.instance.permissionId;
  }

  withRoleId(roleId: string): this {
    return this.with('roleId', roleId);
  }

  withPermissionId(permissionId: string): this {
    return this.with('permissionId', permissionId);
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}