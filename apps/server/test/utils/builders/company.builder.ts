import { Company, CompanyStatuses, KybStatuses } from '@common/database/entities';
import { CompanyTypes } from '@common/database/constants';
import { EntityBuilder } from './base.builder';

export class CompanyBuilder extends EntityBuilder<Company> {
  constructor() {
    super({
      name: 'Test Company',
      rcNumber: 'RC123456',
      isVerified: false,
      status: CompanyStatuses.ACTIVE,
      type: CompanyTypes.INDIVIDUAL,
      tier: '0',
      kybStatus: KybStatuses.PENDING,
    });
  }

  protected validate(): boolean {
    return !!this.instance.name;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}