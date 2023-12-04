import {
  Body,
  Controller,
  Get,
  OnApplicationBootstrap,
  Param,
  // MaxFileSizeValidator,
  // ParseFilePipe,
  Patch,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDetailsDto } from './dto/update-company-details.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { KybDataTypes } from 'src/settings/types';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { CompanyFilters } from './company.filter';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import { RequiredPermission } from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { path } from 'app-root-path';
import { join } from 'path';
import { readFileSync } from 'fs';
import * as settingsKybJson from '@common/config/settings.kyb.json';

let kybSettings = settingsKybJson;

@Controller('company')
export class CompanyController implements OnApplicationBootstrap {
  constructor(private readonly companyService: CompanyService) {}

  onApplicationBootstrap() {
    kybSettings = JSON.parse(
      readFileSync(join(path, 'server.settings', 'settings.kyb.json'), 'utf-8'),
    );
  }

  // new ParseFilePipe({
  //   validators: [
  //     new MaxFileSizeValidator({
  //       maxSize: 2000000,
  //       message: (max) =>
  //         `Files must not exceed - ${(max / (1024 * 1024)).toFixed(2)}MB`,
  //     }),
  //   ],
  // }),

  @Patch('kyb')
  @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS)
  @UseInterceptors(
    FileFieldsInterceptor(
      kybSettings.kybRequirements
        .filter((requirement) => requirement.type === KybDataTypes.FILE)
        .map((requirement) => ({
          name: requirement.name,
          maxCount: 1,
        })),
    ),
  )
  updateCompanyKybDetails(
    @Body(IValidationPipe) data: UpdateCompanyDetailsDto,
    @UploadedFiles()
    files: Record<string, Express.Multer.File[]>,
  ) {
    return this.companyService.updateCompanyKybDetails(data, files);
  }

  @Get()
  getCompanyDetails() {
    return this.companyService.getCompanyDetails();
  }

  @Get('list')
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  listCompanies(
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(CompanyFilters.getCompanies))
    filters: any,
  ) {
    return this.companyService.listCompanies(pagination, filters);
  }

  @Get(':id')
  @RequiredPermission(PERMISSIONS.LIST_COMPANIES)
  getCompanyDetailsById(@Param('id') companyId: string) {
    return this.companyService.getCompanyDetails(companyId);
  }
}
