import { User } from 'src/common/database/entities';

export enum USER_EVENTS {
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
}

export class UserEvent {
  constructor(public readonly user: User) {}
}
export class UserCreatedEvent extends UserEvent {
  constructor(
    public readonly user: User,
    public readonly token: string,
  ) {
    super(user);
  }
}

export class UserUpdatedEvent extends UserEvent {
  constructor(public readonly user: User) {
    super(user);
  }
}

export class UserDeletedEvent extends UserEvent {
  constructor(public readonly user: User) {
    super(user);
  }
}
