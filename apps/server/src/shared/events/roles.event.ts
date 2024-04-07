import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum RoleEvents {
  CREATE_ROLE = 'role.create',
  UPDATE_ROLE = 'role.update',
  DELETE_ROLE = 'role.delete',
  SET_ROLE_PERMISSIONS = 'role.permissions.update',
}

export class RoleEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class CreateRoleEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.CREATE_ROLE, author, metadata);
  }
}

export class UpdateRolesEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.UPDATE_ROLE, author, metadata);
  }
}

export class DeleteRolesEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.DELETE_ROLE, author, metadata);
  }
}

export class SetRolePermissionsEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.SET_ROLE_PERMISSIONS, author, metadata);
  }
}
