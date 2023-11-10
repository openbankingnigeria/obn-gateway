import {
  Body,
  Controller,
  Get,
  Patch,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdatePasswordDto, UpdateProfileDto } from './dto/index.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('')
  @UsePipes(ValidationPipe)
  getProfile() {
    return this.profileService.getProfile();
  }

  @Patch('')
  @UsePipes(ValidationPipe)
  updateProfile(@Body() data: UpdateProfileDto) {
    return this.profileService.updateProfile(data);
  }

  @Patch('password')
  @UsePipes(ValidationPipe)
  updatePassword(@Body() data: UpdatePasswordDto) {
    return this.profileService.updatePassword(data);
  }
}
