import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { PERMISSIONS } from 'src/permissions/types';

export const SKIP_AUTH_METADATA_KEY = 'skip_auth_guard';
export const REQUIRED_PERMISSION_METADATA_KEY = 'allowed_permissions';
export const REQUIRE_TWO_FA_KEY = 'require_two_fa';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_METADATA_KEY, true);

export const RequiredPermission = (permission: PERMISSIONS) =>
  SetMetadata(REQUIRED_PERMISSION_METADATA_KEY, permission);

export const RequireTwoFA = (strict: boolean = false) =>
  SetMetadata(REQUIRE_TWO_FA_KEY, strict);

export const Ctx = createParamDecorator((data, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest();
  return request.ctx;
});
