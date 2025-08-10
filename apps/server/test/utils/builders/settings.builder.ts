import { Settings } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class SettingsBuilder extends EntityBuilder<Settings> {
  constructor() {
    super({
      name: 'test.setting',
      value: 'test-value',
    });
  }

  protected validate(): boolean {
    return !!this.instance.name;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}