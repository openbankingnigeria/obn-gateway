import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/index.dto';
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

  @Patch('password')
  @UsePipes(IValidationPipe)
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.profileService.updatePassword(data);
  }
}
