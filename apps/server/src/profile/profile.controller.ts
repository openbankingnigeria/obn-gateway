import { Body, Controller, Get, Patch, Post, UsePipes } from '@nestjs/common';
import { ProfileService } from './profile.service';
import {
  UpdatePasswordDto,
  UpdateProfileDto,
  UpdateTwoFADto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UsePipes(IValidationPipe)
  getProfile() {
    return this.profileService.getProfile();
  }

  @Patch('')
  @UsePipes(IValidationPipe)
  updateProfile(@Body() data: UpdateProfileDto) {
    return this.profileService.updateProfile(data);
  }

  @Post('/two-fa')
  @UsePipes(IValidationPipe)
  generateTwoFA() {
    return this.profileService.generateTwoFA();
  }

  @Patch('/two-fa')
  @UsePipes(IValidationPipe)
  verifyTwoFA(@Body() data: UpdateTwoFADto) {
    return this.profileService.verifyTwoFA(data);
  }

  @Patch('/two-fa/disable')
  @UsePipes(IValidationPipe)
  disableTwoFA() {
    return this.profileService.disableTwoFA();
  }

  @Patch('password')
  @UsePipes(IValidationPipe)
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.profileService.updatePassword(data);
  }
}
