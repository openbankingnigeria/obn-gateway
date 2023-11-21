import { User } from 'src/common/database/entities';
import { BaseEvent } from './base.event';

export enum USER_EVENTS {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
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
    public readonly token: string,
    public readonly metadata: any = {},
  ) {
    super(USER_EVENTS.USER_CREATED, author, user, metadata);
  }
}

export class UserUpdatedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(USER_EVENTS.USER_UPDATED, author, user, metadata);
  }
}

export class UserDeletedEvent extends UserEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(USER_EVENTS.USER_DELETED, author, user, metadata);
  }
}
