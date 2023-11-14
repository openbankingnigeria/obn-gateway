import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS } from 'src/permissions/types';

export const SKIP_AUTH_METADATA_KEY = 'skip_auth_guard';
export const REQUIRED_PERMISSION_METADATA_KEY = 'allowed_permissions';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_METADATA_KEY, true);

export const RequiredPermission = (permission: PERMISSIONS) =>
  SetMetadata(REQUIRED_PERMISSION_METADATA_KEY, permission);