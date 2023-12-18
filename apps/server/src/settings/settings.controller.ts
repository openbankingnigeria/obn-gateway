import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UsePipes,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  IPRestrictionRequest,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { RequireTwoFA } from '@common/utils/authentication/auth.decorator';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

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

  @Get('api-key/:environment')
  @RequireTwoFA()
  getApiKey(@Param('environment') environment: KONG_ENVIRONMENT) {
    return this.settingsService.getApiKey(environment);
  }

  @Put('api-key/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  generateApiKey(@Param('environment') environment: KONG_ENVIRONMENT) {
    return this.settingsService.generateApiKey(environment);
  }

  @Get('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  getIPRestriction(@Param('environment') environment: KONG_ENVIRONMENT) {
    return this.settingsService.getIPRestriction(environment);
  }

  @Put('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  setIPRestriction(
    @Param('environment') environment: KONG_ENVIRONMENT,
    @Body() data: IPRestrictionRequest,
  ) {
    return this.settingsService.setIPRestriction(environment, data);
  }
}
