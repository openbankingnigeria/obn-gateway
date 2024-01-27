import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  UsePipes,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import {
  IPRestrictionRequest,
  SettingsUpdateDtos,
  UpdateCompanySubtypesRequest,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  Ctx,
  RequireTwoFA,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { RequestContext } from '@common/utils/request/request-context';
import { SETTINGS_TYPES } from './types';
import { PERMISSIONS } from '@permissions/types';
import { APIInterceptor } from 'src/apis/apis.interceptor';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('kyb/requirements')
  @RequiredPermission(PERMISSIONS.VIEW_KYB_REQUIREMENTS)
  getKybRequirements(@Ctx() ctx: RequestContext) {
    return this.settingsService.getKybRequirements(ctx);
  }

  @Patch('kyb/requirements')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_KYB_REQUIREMENTS)
  updateKybRequirements(
    @Ctx() ctx: RequestContext,
    @Body() data: UpdateKybRequirementsDto,
  ) {
    return this.settingsService.updateKybRequirements(ctx, data);
  }

  @Patch('company/types')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_TYPES)
  updateCompanySubtypes(
    @Ctx() ctx: RequestContext,
    @Body() data: UpdateCompanySubtypesRequest,
  ) {
    return this.settingsService.updateCompanySubTypes(ctx, data);
  }

  @Get('api-key/:environment')
  @RequiredPermission(PERMISSIONS.VIEW_API_KEY)
  @RequireTwoFA(true)
  @UseInterceptors(APIInterceptor)
  getApiKey(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.getApiKey(ctx, environment);
  }

  @Put('api-key/:environment')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.RESET_API_KEY)
  @RequireTwoFA(true)
  @UseInterceptors(APIInterceptor)
  generateApiKey(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.generateApiKey(ctx, environment);
  }

  @Get('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.VIEW_API_RESTRICTIONS)
  @RequireTwoFA()
  @UseInterceptors(APIInterceptor)
  getIPRestriction(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
  ) {
    return this.settingsService.getIPRestriction(ctx, environment);
  }

  @Put('ip-restriction/:environment')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.SET_API_RESTRICTIONS)
  @RequireTwoFA()
  @UseInterceptors(APIInterceptor)
  setIPRestriction(
    @Ctx() ctx: RequestContext,
    @Param('environment') environment: KONG_ENVIRONMENT,
    @Body() data: IPRestrictionRequest,
  ) {
    return this.settingsService.setIPRestriction(ctx, environment, data);
  }

  @Put(':settingsType')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_SYSTEM_SETTING)
  async editSettings(
    @Body() data: any,
    @Ctx() ctx: RequestContext,
    @Param('settingsType') settingsType: SETTINGS_TYPES,
  ) {
    const validationPipe = new IValidationPipe();

    await validationPipe.transform(data, {
      type: 'body',
      metatype: SettingsUpdateDtos[settingsType],
    });
    return this.settingsService.editSettings(ctx, settingsType, data);
  }

  @Get(':settingsType')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.VIEW_SYSTEM_SETTING)
  @SerializeOptions({
    strategy: 'exposeAll',
  })
  viewSettings(@Param('settingsType') settingsType: SETTINGS_TYPES) {
    return this.settingsService.viewSettings(settingsType);
  }
}
