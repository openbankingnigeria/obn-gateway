import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum SettingsEvents {
  UPDATE_KYB_REQUIREMENTS = 'settings.kyb.update',
  UPDATE_COMPANY_SUBTYPES = 'settings.company_types.update',
  GET_API_KEY = 'settings.api.key.view',
  GENERATE_API_KEY = 'settings.api.key.create',
  SET_IP_RESTRICTIOIN = 'settings.api.restriction.create',
  EDIT_SETTINGS = 'settings.update',
  SET_CLIENT_EVENT = 'settings.api.client.create',
}

export class SettingsEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class UpdateKybRequirementsEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.UPDATE_KYB_REQUIREMENTS, author, metadata);
  }
}

export class UpdateCompanySubtypesEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.UPDATE_COMPANY_SUBTYPES, author, metadata);
  }
}

export class GetApiKeyEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.GET_API_KEY, author, metadata);
  }
}

export class GenerateApiKeyEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.GENERATE_API_KEY, author, metadata);
  }
}

export class SetIPRestrictionEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.SET_IP_RESTRICTIOIN, author, metadata);
  }
}

export class EditSettingsEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.EDIT_SETTINGS, author, metadata);
  }
}

export class SetClientEvent extends SettingsEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(SettingsEvents.SET_CLIENT_EVENT, author, metadata);
  }
}
