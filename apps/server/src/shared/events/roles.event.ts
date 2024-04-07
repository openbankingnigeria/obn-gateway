import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum RoleEvents {
  CREATE_ROLE = 'role.create',
  LIST_ROLE = 'role.view',
  UPDATE_ROLE = 'role.update',
  DELETE_ROLE = 'role.delete',
  GET_ROLE_PERMISSIONS = 'role.permissions.view',
  GET_PERMISSIONS = 'permissions.view',
  GET_STATS = 'role.stats.view',
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

export class ListRolesEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.LIST_ROLE, author, metadata);
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

export class GetRolePermissionsEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.GET_ROLE_PERMISSIONS, author, metadata);
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

export class GetPermissionsEvent extends RoleEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(RoleEvents.GET_PERMISSIONS, author, metadata);
  }
}
