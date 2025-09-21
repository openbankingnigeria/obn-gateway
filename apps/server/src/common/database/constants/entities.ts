import { Company } from '../entities/company.entity';
import { Profile } from '../entities/profile.entity';
import { Role } from '../entities/role.entity';
import { Settings } from '../entities/settings.entity';
import { User } from '../entities/user.entity';
import { TwoFaBackupCode } from '../entities/twofabackupcode.entity';
import {
  AuditLog,
  Collection,
  CollectionRoute,
  CompanyKybData,
  EmailTemplate,
  Permission,
  RolePermission,
} from '../entities';

// Export a minimal list for auth tests to avoid circular dependency issues
// Only include entities directly used in auth tests to prevent circular dependencies
export const ENTITIES = [
  Company,
  Profile,
  User,
  Role,
  AuditLog,
  RolePermission,
  Permission,
  Settings,
  Collection,
  CollectionRoute,
  EmailTemplate,
  TwoFaBackupCode,
  CompanyKybData,
];

// console.log({ENTITIES})
