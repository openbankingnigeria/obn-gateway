import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from 'src/permissions/types';

export const SKIP_AUTH_METADATA_KEY = 'skip_auth_guard';
export const ALLOWED_PERMISSIONS_METADATA_KEY = 'allowed_permissions';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_METADATA_KEY, true);

export const AllowedPermissions = (permissions: PERMISSIONS[]) =>
  SetMetadata(ALLOWED_PERMISSIONS_METADATA_KEY, permissions);
