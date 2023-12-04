import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateKybRequirementsDto } from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('kyb/requirements')
  getKybRequirements() {
    return this.settingsService.getKybRequirements();
  }

  @Patch('kyb/requirements')
  @UsePipes(IValidationPipe)
  updateKybRequirements(@Body() data: UpdateKybRequirementsDto) {
    return this.settingsService.updateKybRequirements(data);
  }
}
