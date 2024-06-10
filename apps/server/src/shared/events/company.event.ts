import { Company, User } from '@common/database/entities';
import { BaseEvent } from './base.event';

export enum CompanyEvents {
  COMPANY_KYB_APPROVED = 'company.kyb.approved',
  COMPANY_KYB_DENIED = 'company.kyb.denied',
  COMPANY_KYB_SUBMITTED = 'company.kyb.submitted',
}

export class CompanyEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly company: Company,
    public readonly metadata?: any,
  ) {
    super(name, author);
  }
}
export class CompanyApprovedEvent extends CompanyEvent {
  constructor(
    public readonly author: User,
    public readonly company: Company,
    public readonly metadata: any = {},
  ) {
    super(CompanyEvents.COMPANY_KYB_APPROVED, author, company, metadata);
  }
}

export class CompanyKybSubmittedEvent extends CompanyEvent {
  constructor(
    public readonly author: User,
    public readonly company: Company,
    public readonly metadata: any = {},
  ) {
    super(CompanyEvents.COMPANY_KYB_SUBMITTED, author, company, metadata);
  }
}

export class CompanyDeniedEvent extends CompanyEvent {
  constructor(
    public readonly author: User,
    public readonly company: Company,
    public readonly metadata: { reason: string },
  ) {
    super(CompanyEvents.COMPANY_KYB_DENIED, author, company, metadata);
  }
}
