import { Company, User } from '@common/database/entities';
import { ROLES } from '@common/database/constants';

export class RequestContext {
  constructor(
    protected options: {
      user: User;
    },
  ) {}

  copy(): RequestContext {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }

  get activeUser(): User {
    if (!this.options?.user) {
      throw new Error('No active user');
    }
    return this.options.user;
  }

  get activeCompany(): Company {
    if (!this.activeUser?.company) {
      throw new Error('No active company');
    }
    return this.activeUser.company;
  }

  get activeUserType(): ROLES {
    if (!this.activeUser?.role?.parent?.slug) {
      throw new Error('No active user type');
    }
    return this.activeUser.role.parent.slug as ROLES;
  }
}
