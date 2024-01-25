import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
} from '@nestjs/common';
import { APIService } from './apis.service';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  APIParam,
  UpdateAPIDto,
  CreateAPIDto,
  GetAPILogsDto,
  SetAPITransformationDTO,
  UpdateCompanyAPIAccessDto,
} from './dto/index.dto';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import { APIFilters } from './apis.filter';
import {
  Ctx,
  RequireTwoFA,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { RequestContext } from '@common/utils/request/request-context';
import { PERMISSIONS } from '@permissions/types';

@Controller('apis/:environment')
export class APIController {
  constructor(private readonly apiService: APIService) {}

  @Get('')
  @UsePipes(IValidationPipe)
  viewAPIs(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(APIFilters.listAPIs)) filters: any,
  ) {
    return this.apiService.viewAPIs(
      ctx,
      params.environment,
      pagination,
      filters,
    );
  }

  @Post('')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  createAPI(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Body() data: CreateAPIDto,
  ) {
    return this.apiService.createAPI(ctx, params.environment, data);
  }

  @Put('company/:companyId')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  assignAPIs(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('companyId') companyId: string,
    @Body() data: UpdateCompanyAPIAccessDto,
  ) {
    return this.apiService.updateCompanyApiAccess(
      ctx,
      params.environment,
      companyId,
      data,
    );
  }

  @Get('company')
  @UsePipes(IValidationPipe)
  viewMyCompanyApis(@Ctx() ctx: RequestContext, @Param() params: APIParam) {
    return this.apiService.getApisAssignedToCompany(ctx, params.environment);
  }

  @Get('company/:companyId')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.VIEW_COMPANY_APIS_BY_ID)
  viewCompanyApis(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('companyId') companyId: string,
  ) {
    return this.apiService.getApisAssignedToCompany(
      ctx,
      params.environment,
      companyId,
    );
  }

  @Get('logs')
  @UsePipes(IValidationPipe)
  getAPILogs(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query() filters: GetAPILogsDto,
  ) {
    return this.apiService.getAPILogs(
      ctx,
      params.environment,
      pagination,
      filters,
    );
  }

  @Get('logs/stats')
  @UsePipes(IValidationPipe)
  getAPILogsStats(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Query() filters: GetAPILogsDto,
  ) {
    return this.apiService.getAPILogsStats(ctx, params.environment, filters);
  }

  @Get('logs/stats/periodic-aggregate')
  @UsePipes(IValidationPipe)
  getAPILogsStatsAggregate(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Query() filters: GetAPILogsDto,
  ) {
    return this.apiService.getAPILogsStatsAggregate(
      ctx,
      params.environment,
      filters,
    );
  }

  @Get('logs/:id')
  @UsePipes(IValidationPipe)
  getAPILog(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
  ) {
    return this.apiService.getAPILog(ctx, params.environment, id);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  viewAPI(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
  ) {
    return this.apiService.viewAPI(ctx, params.environment, id);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  deletAPI(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
  ) {
    return this.apiService.deleteAPI(ctx, params.environment, id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  updateAPI(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
    @Body() data: UpdateAPIDto,
  ) {
    return this.apiService.updateAPI(ctx, params.environment, id, data);
  }

  @Get(':id/transformation')
  @UsePipes(IValidationPipe)
  getTransformation(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
  ) {
    return this.apiService.getTransformation(ctx, params.environment, id);
  }

  @Put(':id/transformation')
  @UsePipes(IValidationPipe)
  @RequireTwoFA(true)
  setTransformation(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('id') id: string,
    @Body() data: SetAPITransformationDTO,
  ) {
    return this.apiService.setTransformation(ctx, params.environment, id, data);
  }
}
