import { Body, Controller, Get, Patch, Post, UsePipes } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  UpdatePasswordDto,
  UpdateProfileDto,
  UpdateTwoFADto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { Ctx } from '@common/utils/authentication/auth.decorator';
import { RequestContext } from '@common/utils/request/request-context';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UsePipes(IValidationPipe)
  getProfile(@Ctx() ctx: RequestContext) {
    return this.profileService.getProfile(ctx);
  }

  @Patch('')
  @UsePipes(IValidationPipe)
  updateProfile(@Ctx() ctx: RequestContext, @Body() data: UpdateProfileDto) {
    return this.profileService.updateProfile(ctx, data);
  }

  @Post('/two-fa')
  @UsePipes(IValidationPipe)
  generateTwoFA(@Ctx() ctx: RequestContext) {
    return this.profileService.generateTwoFA(ctx);
  }

  @Patch('/two-fa')
  @UsePipes(IValidationPipe)
  verifyTwoFA(@Ctx() ctx: RequestContext, @Body() data: UpdateTwoFADto) {
    return this.profileService.verifyTwoFA(ctx, data);
  }

  @Patch('/two-fa/disable')
  @UsePipes(IValidationPipe)
  disableTwoFA(@Ctx() ctx: RequestContext, @Body() data: UpdateTwoFADto) {
    return this.profileService.disableTwoFA(ctx, data);
  }

  @Patch('password')
  @UsePipes(IValidationPipe)
  updatePassword(@Ctx() ctx: RequestContext, @Body() data: UpdatePasswordDto) {
    return this.profileService.updatePassword(ctx, data);
  }
}
