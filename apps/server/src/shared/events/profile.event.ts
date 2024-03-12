import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum ProfileEvents {
  UPDATE_PROFILE = 'profile.update',
  GENERATE_2FA = 'profile.2fa.generate',
  VERIFY_2FA = 'profile.2fa.verify',
  DISABLE_2FA = 'profile.2fa.disable',
}

export class ProfileEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class UpdateProfileEvent extends ProfileEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ProfileEvents.UPDATE_PROFILE, author, metadata);
  }
}

export class Generate2FaEvent extends ProfileEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ProfileEvents.GENERATE_2FA, author, metadata);
  }
}

export class Verify2FaEvent extends ProfileEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ProfileEvents.VERIFY_2FA, author, metadata);
  }
}

export class Disable2FaEvent extends ProfileEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(ProfileEvents.DISABLE_2FA, author, metadata);
  }
}
