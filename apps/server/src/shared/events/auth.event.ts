import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum AuthEvents {
  SIGN_UP = 'auth.signup',
  LOGIN = 'auth.login',
  SET_PASSWORD = 'auth.set-password',
  RESET_PASSWORD_REQUEST = 'auth.reset-password-request',
  RESET_PASSWORD = 'auth.reset-password',
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

export class AuthResendOtpEvent extends AuthEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: { otp: string; apiProvider?: string },
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

export class AuthSetPasswordEvent extends AuthEvent {
  constructor(
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(AuthEvents.SET_PASSWORD, user, metadata);
  }
}

export class AuthResetPasswordRequestEvent extends AuthEvent {
  constructor(
    public readonly user: User,
    public readonly metadata: { token: string; [k: string]: any },
  ) {
    super(AuthEvents.RESET_PASSWORD_REQUEST, user, metadata);
  }
}

export class AuthResetPasswordEvent extends AuthEvent {
  constructor(
    public readonly user: User,
    public readonly metadata: any = {},
  ) {
    super(AuthEvents.RESET_PASSWORD_REQUEST, user, metadata);
  }
}
