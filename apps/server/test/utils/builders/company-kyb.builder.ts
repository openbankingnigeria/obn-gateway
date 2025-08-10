import { CompanyKybData } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class CompanyKybDataBuilder extends EntityBuilder<CompanyKybData> {
  constructor() {
    super({
      data: 'Test KYB data',
    });
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}