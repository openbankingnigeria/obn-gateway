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
  UpdateCompanySubtypesRequest,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { Ctx, RequireTwoFA } from '@common/utils/authentication/auth.decorator';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { RequestContext } from '@common/utils/request/request-context';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('kyb/requirements')
  getKybRequirements(@Ctx() ctx: RequestContext) {
    return this.settingsService.getKybRequirements(ctx);
  }

  @Patch('kyb/requirements')
  @UsePipes(IValidationPipe)
  updateKybRequirements(
    @Ctx() ctx: RequestContext,
    @Body() data: UpdateKybRequirementsDto,
  ) {
    return this.settingsService.updateKybRequirements(ctx, data);
  }

  @Patch('company/types')
  @UsePipes(IValidationPipe)
  updateCompanySubtypes(
    @Ctx() ctx: RequestContext,
    @Body() data: UpdateCompanySubtypesRequest,
  ) {
    return this.settingsService.updateCompanySubTypes(ctx, data);
  }

  @Get('api-key/:environment')
  @RequireTwoFA()
  getApiKey(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.getApiKey(ctx, environment);
  }

  @Put('api-key/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  generateApiKey(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.generateApiKey(ctx, environment);
  }

  @Get('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  getIPRestriction(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.getIPRestriction(ctx, environment);
  }

  @Put('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  setIPRestriction(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
    @Body() data: IPRestrictionRequest,
  ) {
    return this.settingsService.setIPRestriction(ctx, environment, data);
  }
}
