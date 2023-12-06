import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { companyErrors } from './company.errors';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { KybDataTypes, Settings } from '@settings/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Company, User } from '@common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { path } from 'app-root-path';
import { join } from 'path';
import { readFileSync } from 'fs';

@Injectable()
export class CompanyService {
  constructor(
    private readonly fileHelpers: FileHelpers,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly requestContext: RequestContextService,
  ) {}

  private readonly kybSettings: Settings = JSON.parse(
    readFileSync(join(path, 'server.settings', 'settings.kyb.json'), 'utf-8'),
  );

  async updateCompanyKybDetails(
    data: any,
    files: Record<string, Express.Multer.File[]>,
  ) {
    if (this.requestContext.user!.company.isVerified) {
      throw new IBadRequestException({
        message: companyErrors.companyAlreadyVerified,
      });
    }
    // If a file is uploaded is present, validate image size
    if (Object.keys(files).length) {
      const { isValid, maxFileSize } = this.fileHelpers.validateFileSize(files);

      if (!isValid) {
        throw new IBadRequestException({
          message: companyErrors.fileTooLarge(maxFileSize),
        });
      }
    }

    const dataKeys = Object.keys(data);
    const validKybData: Record<
      string,
      { file: Buffer; fileName: string } | string
    > = {};

    // Select only valid fields from the request payload
    this.kybSettings.kybRequirements
      .filter((requirement) => requirement.type === KybDataTypes.STRING)
      .forEach((requirement) => {
        if (dataKeys.includes(requirement.name)) {
          validKybData[requirement.name] = data[requirement.name];
        }
      });

    const previousKybDetails = this.requestContext.user!.company.kybData
      ? JSON.parse(this.requestContext.user!.company.kybData)
      : {};

    Object.keys(files).forEach((fileKey) => {
      const fileArray = files[fileKey];

      fileArray.forEach((file) => {
        validKybData[fileKey] = {
          file: file.buffer,
          fileName: file.originalname,
        };
      });
    });

    await this.companyRepository.update(
      { id: this.requestContext.user!.company.id },
      {
        kybData: JSON.stringify({ ...previousKybDetails, ...validKybData }),
      },
    );

    return ResponseFormatter.success(
      'Successfully updated company KYB details.',
    );
  }

  async getCompanyDetails(companyId?: string) {
    const company = companyId
      ? await this.companyRepository.findOne({ where: { id: companyId } })
      : this.requestContext.user!.company;

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }
    const kybDetails: any = {};

    if (!company.kybData) {
      throw new IBadRequestException({
        message: companyErrors.noKybDetailsFound,
      });
    }

    const kybData = JSON.parse(company.kybData);

    for (const key of Object.keys(kybData)) {
      if (typeof kybData![key] === 'string') {
        kybDetails[key] = kybData![key];
      } else {
        const fileObject = kybData![key] as {
          file: Buffer;
          fileName: string;
        };
        kybDetails[key] = {
          fileName: fileObject.fileName,
          file: Buffer.from(fileObject.file).toString('base64url'),
        };
      }
    }

    return ResponseFormatter.success('Successfully fetched company details', {
      ...company,
      kybData: kybDetails,
    });
  }

  async listCompanies({ limit, page }: PaginationParameters, filters?: any) {
    const totalCompanies = await this.companyRepository.count({
      where: {
        ...filters,
      },
    });
    const companies = await this.companyRepository.find({
      where: { ...filters },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      select: {
        name: true,
        createdAt: true,
        updatedAt: true,
        rcNumber: true,
        type: true,
        isVerified: true,
        deletedAt: true,
        id: true,
      },
    });

    return ResponseFormatter.success(
      'Successfully fetched company',
      companies,
      {
        totalNumberOfRecords: totalCompanies,
        totalNumberOfPages: Math.ceil(totalCompanies / limit),
        pageNumber: page,
        pageSize: limit,
      },
    );
  }
}
