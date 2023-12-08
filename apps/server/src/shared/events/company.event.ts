import { Profile, User } from 'src/common/database/entities';
import { BaseEvent } from './base.event';

export enum CompanyEvents {
  COMPANY_KYB_APPROVED = 'company.kyb.approved',
  COMPANY_KYB_DENIED = 'company.kyb.denied',
}

export class CompanyEvent extends BaseEvent {
  constructor(
    public readonly name: string,
    public readonly author: User,
    public readonly user: User,
    public readonly metadata?: any,
  ) {
    super(name, author);
  }
}
export class CompanyApprovedEvent extends CompanyEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: {
      admins: (User & { profile: Profile })[];
      apiProvider: string;
    },
  ) {
    super(CompanyEvents.COMPANY_KYB_APPROVED, author, user, metadata);
  }
}

export class CompanyDeniedEvent extends CompanyEvent {
  constructor(
    public readonly author: User,
    public readonly user: User,
    public readonly metadata: {
      admins: (User & { profile: Profile })[];
      reason: string;
    },
  ) {
    super(CompanyEvents.COMPANY_KYB_DENIED, author, user, metadata);
  }
}
