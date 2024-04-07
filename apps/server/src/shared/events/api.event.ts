import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum ApiEvents {
  DELETE_APIS = 'apis.delete',
  CREATE_APIS = 'apis.create',
  UPDATE_APIS = 'apis.update',
  SET_TRANSFORMATION = 'apis.transformation.set',
  ASSIGN_APIS = 'apis.assign',
  UNASSIGN_APIS = 'apis.unassign',
}

export class ApiEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class DeleteApisEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.DELETE_APIS, author, metadata);
  }
}

export class CreateApiEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.CREATE_APIS, author, metadata);
  }
}

export class AssignApiEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.ASSIGN_APIS, author, metadata);
  }
}

export class UnassignApiEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.UNASSIGN_APIS, author, metadata);
  }
}

export class UpdateApiEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.UPDATE_APIS, author, metadata);
  }
}

export class SetApiTransformationEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.SET_TRANSFORMATION, author, metadata);
  }
}
