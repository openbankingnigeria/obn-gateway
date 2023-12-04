import {
  Body,
  Controller,
  Get,
  Param,
  // MaxFileSizeValidator,
  // ParseFilePipe,
  Patch,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { UpdateCompanyDetailsDto } from './dto/update-company-details.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as settingsKybJson from '../settings/settings.kyb.json';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { KybDataTypes } from 'src/settings/types';
// import { RequiredPermission } from '@common/utils/authentication/auth.decorator';
// import { PERMISSIONS } from '@permissions/types';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

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
  // @RequiredPermission(PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS)
  @UseInterceptors(
    FileFieldsInterceptor(
      settingsKybJson.kybRequirements
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

  @Get('kyb')
  getCompanyKybDetails() {
    return this.companyService.getCompanyKybDetails();
  }

  @Get(':id/kyb')
  getCompanyKybDetailsById(@Param('id') companyId: string) {
    return this.companyService.getCompanyKybDetails(companyId);
  }
}
