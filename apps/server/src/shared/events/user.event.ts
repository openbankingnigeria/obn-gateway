import { User } from 'src/common/database/entities';
import { BaseEvent } from './base.event';

export enum UserEvents {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_DEACTIVATED = 'user.deactivated',
  USER_REACTIVATED = 'user.reactivated',
}

export class UserEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}
export class UserCreatedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: { token: string; [k: string]: any },
  ) {
    super(UserEvents.USER_CREATED, author, user, metadata);
  }
}

export class UserUpdatedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(UserEvents.USER_UPDATED, author, user, metadata);
  }
}

export class UserDeletedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(UserEvents.USER_DELETED, author, user, metadata);
  }
}

export class UserDeactivatedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
  ) {
    super(UserEvents.USER_DEACTIVATED, author, user);
  }
}

export class UserReactivatedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
  ) {
    super(UserEvents.USER_REACTIVATED, author, user);
  }
}
