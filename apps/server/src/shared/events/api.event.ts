import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum ApiEvents {
  VIEW_APIS = 'apis.view',
  DELETE_APIS = 'apis.delete',
  CREATE_APIS = 'apis.create',
  UPDATE_APIS = 'apis.update',
  VIEW_API_LOGS = 'apis.logs.view',
  VIEW_API_LOG_STATS = 'apis.log-stats.view',
  VIEW_COMPANY_APIS = 'apis.company.view',
  SET_TRANSFORMATION = 'apis.transformation.set',
  GET_TRANSFORMATION = 'apis.transformation.view',
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

export class ViewCompanyApisEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.VIEW_COMPANY_APIS, author, metadata);
  }
}

export class ViewApisEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.VIEW_APIS, author, metadata);
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

export class GetApiLogEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.VIEW_API_LOGS, author, metadata);
  }
}

export class GetApiLogStatsEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.VIEW_API_LOG_STATS, author, metadata);
  }
}

export class GetApiTransformationEvent extends ApiEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ApiEvents.GET_TRANSFORMATION, author, metadata);
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
