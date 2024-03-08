import { User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum CollectionEvents {
  VIEW_COLLECTIONS = 'collections.view',
  CREATE_COLLECTIONS = 'collections.create',
  UPDATE_COLLECTIONS = 'collections.update',
  DELETE_COLLECTIONS = 'collections.delete',
  VIEW_COMPANY_COLLECTIONS = 'collections.company.view',
}

export class CollectionEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly metadata: any = {},
  ) {
    super(name, author);
  }
}

export class ViewCollectionEvent extends CollectionEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(CollectionEvents.VIEW_COLLECTIONS, author, metadata);
  }
}

export class CreateCollectionEvent extends CollectionEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(CollectionEvents.CREATE_COLLECTIONS, author, metadata);
  }
}

export class UpdateCollectionEvent extends CollectionEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(CollectionEvents.UPDATE_COLLECTIONS, author, metadata);
  }
}

export class DeleteCollectionEvent extends CollectionEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(CollectionEvents.DELETE_COLLECTIONS, author, metadata);
  }
}

export class ViewCompanyCollectionEvent extends CollectionEvent {
  constructor(
    public readonly author: User,
    public readonly metadata: any,
  ) {
    super(CollectionEvents.VIEW_COMPANY_COLLECTIONS, author, metadata);
  }
}
