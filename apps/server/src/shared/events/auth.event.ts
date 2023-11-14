import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum AuthEvents {
  SIGN_UP = 'auth.signup',
  LOGIN = 'auth.login',
}
export class AuthEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}
export class AuthSignupEvent extends AuthEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(AuthEvents.SIGN_UP, author, metadata);
  }
}

export class AuthLoginEvent extends AuthEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(AuthEvents.LOGIN, author, metadata);
  }
}
