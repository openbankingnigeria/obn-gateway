import { Collection } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class CollectionBuilder extends EntityBuilder<Collection> {
  constructor() {
    super({
      name: 'Test Collection',
      slug: 'test-collection',
      description: 'Test collection description',
    });
  }

  protected validate(): boolean {
    return !!this.instance.name && !!this.instance.slug;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}