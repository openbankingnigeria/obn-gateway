import { Controller, Get } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('kyb/requirements')
  getKybRequirements() {
    return this.settingsService.getKybRequirements();
  }
}
