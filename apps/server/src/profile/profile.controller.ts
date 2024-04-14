import { Body, Controller, Get, Patch, Post, UsePipes } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  UpdatePasswordDto,
  UpdateProfileDto,
  UpdateTwoFADto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  Ctx,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { RequestContext } from '@common/utils/request/request-context';
import { PERMISSIONS } from '@permissions/types';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @RequiredPermission(PERMISSIONS.VIEW_PROFILE)
  @UsePipes(IValidationPipe)
  getProfile(@Ctx() ctx: RequestContext) {
    return this.profileService.getProfile(ctx);
  }

  @Patch('')
  @RequiredPermission(PERMISSIONS.UPDATE_PROFILE)
  @UsePipes(IValidationPipe)
  updateProfile(@Ctx() ctx: RequestContext, @Body() data: UpdateProfileDto) {
    return this.profileService.updateProfile(ctx, data);
  }

  @Post('/two-fa')
  @RequiredPermission(PERMISSIONS.ENABLE_TWOFA)
  @UsePipes(IValidationPipe)
  generateTwoFA(@Ctx() ctx: RequestContext) {
    return this.profileService.generateTwoFA(ctx);
  }

  @Patch('/two-fa')
  @RequiredPermission(PERMISSIONS.ENABLE_TWOFA)
  @UsePipes(IValidationPipe)
  verifyTwoFA(@Ctx() ctx: RequestContext, @Body() data: UpdateTwoFADto) {
    return this.profileService.verifyTwoFA(ctx, data);
  }

  @Patch('/two-fa/disable')
  @RequiredPermission(PERMISSIONS.DISABLE_TWOFA)
  @UsePipes(IValidationPipe)
  disableTwoFA(@Ctx() ctx: RequestContext, @Body() data: UpdateTwoFADto) {
    return this.profileService.disableTwoFA(ctx, data);
  }

  @Patch('password')
  @RequiredPermission(PERMISSIONS.CHANGE_PASSWORD)
  @UsePipes(IValidationPipe)
  updatePassword(@Ctx() ctx: RequestContext, @Body() data: UpdatePasswordDto) {
    return this.profileService.updatePassword(ctx, data);
  }
}
