import { CollectionRoute } from '@common/database/entities';
import { EntityBuilder } from './base.builder';
import { HTTP_METHODS } from 'src/apis/types';

export class CollectionRouteBuilder extends EntityBuilder<CollectionRoute> {
  constructor() {
    super({
      name: 'Test Route',
      slug: 'test-route',
      introspectAuthorization: false,
      method: HTTP_METHODS.GET,
      url: '/test',
      environment: 'development',
      enabled: true,
    });
  }

  protected validate(): boolean {
    return !!this.instance.name && !!this.instance.slug;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}