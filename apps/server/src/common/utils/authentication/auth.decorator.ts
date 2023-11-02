import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_METADATA_KEY = 'skip_auth_guard';

export const SkipAuthGuard = () => SetMetadata(SKIP_AUTH_METADATA_KEY, true);
