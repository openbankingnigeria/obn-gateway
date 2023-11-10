import { User } from 'src/common/database/entities';

export enum USER_EVENTS {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
}

export class UserCreatedEvent {
  constructor(
    public readonly user: User,
    public readonly token: string,
  ) {}
}

export class UserUpdatedEvent {
  constructor(public readonly user: User) {}
}

export class UserDeletedEvent {
  constructor(public readonly user: User) {}
}
