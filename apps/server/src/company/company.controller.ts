import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  // Post,
  Query,
  SerializeOptions,
  UploadedFiles,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  GetStatsDto,
  UpdateCompanyDetailsDto,
  UpdateKybStatusDto,
} from './dto/index.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { CompanyFilters } from './company.filter';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import {
  Ctx,
  RequiredPermission,
  SkipAuthGuard,
} from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { CompanyTypes } from '@common/database/constants';
import { RequestContext } from '@common/utils/request/request-context';

@Controller()
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Patch('company/kyb')
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS)
  @UseInterceptors(AnyFilesInterceptor({}))
  updateCompanyKybDetails(
    @Ctx() ctx: RequestContext,
    @Body(IValidationPipe) data: UpdateCompanyDetailsDto,
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    return this.companyService.updateCompanyKybDetails(ctx, data, files);
  }

  @Get('company/me')
  @RequiredPermission(PERMISSIONS.VIEW_COMPANY_DETAILS)
  getCompanyDetails(@Ctx() ctx: RequestContext) {
    return this.companyService.getCompanyDetails(ctx);
  }

  @Get('company/types')
  @SkipAuthGuard()
  @SerializeOptions({
    strategy: 'exposeAll',
  })
  getCompanyTypes() {
    return this.companyService.getCompanyTypes();
  }

  @Get('companies')
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  listCompanies(
    @Ctx() ctx: RequestContext,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(CompanyFilters.getCompanies))
    filters: any,
  ) {
    return this.companyService.listCompanies(ctx, pagination, filters);
  }

  @Get('companies/stats')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  getCompaniesStats(@Ctx() ctx: RequestContext) {
    return this.companyService.getCompaniesStats(ctx);
  }

  @Get('companies/stats/kyb')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  getCompaniesKybStats(@Ctx() ctx: RequestContext) {
    return this.companyService.getCompaniesKybStats(ctx);
  }

  @Get('companies/:id')
  @RequiredPermission(PERMISSIONS.VIEW_COMPANY)
  getCompanyDetailsById(
    @Ctx() ctx: RequestContext,
    @Param('id') companyId: string,
  ) {
    return this.companyService.getCompanyDetails(ctx, companyId);
  }

  @Get('company/:companyType/fields')
  @SkipAuthGuard()
  @SerializeOptions({
    strategy: 'exposeAll',
  })
  getCompanyCustomFields(@Param('companyType') companyType: CompanyTypes) {
    return this.companyService.getCompanyCustomFields(companyType);
  }

  // @Post('companies/rc/verify')
  // @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_KYB_STATUS)
  // @UsePipes(IValidationPipe)
  // verifyCompanyRC(@Ctx() ctx: RequestContext, @Body() data: UpdateCompanyDetailsDto) {
  //   return this.companyService.verifyCompanyRC(ctx, data.rcNumber);
  // }

  @Get('companies/stats/periodic-aggregate')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  getCompaniesStatsAggregate(
    @Ctx() ctx: RequestContext,
    @Query() filters: GetStatsDto,
  ) {
    return this.companyService.getCompaniesStatsAggregate(ctx, filters);
  }

  @Patch('companies/:id/kyb/status')
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_KYB_STATUS)
  @UsePipes(IValidationPipe)
  updateKybStatus(
    @Ctx() ctx: RequestContext,
    @Body() data: UpdateKybStatusDto,
    @Param('id') companyId: string,
  ) {
    return this.companyService.updateKYBStatus(ctx, companyId, data);
  }

  @Patch('companies/:id/activate')
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_ACCESS)
  activateCompanyAccess(
    @Ctx() ctx: RequestContext,
    @Param('id') companyId: string,
  ) {
    return this.companyService.toggleCompanyAccess(ctx, companyId, true);
  }

  @Patch('companies/:id/deactivate')
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_ACCESS)
  deactivateCompanyAccess(
    @Ctx() ctx: RequestContext,
    @Param('id') companyId: string,
  ) {
    return this.companyService.toggleCompanyAccess(ctx, companyId, false);
  }

  @Get('agreements')
  @SkipAuthGuard()
  @SerializeOptions({ strategy: 'exposeAll' })
  getUserAgreements() {
    return this.companyService.getUserAgreements();
  }
}
