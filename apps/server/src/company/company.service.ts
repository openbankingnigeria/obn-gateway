import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { companyErrors } from './company.errors';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { KybDataTypes, KybSettings } from '@settings/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Company, Profile, Settings, User } from '@common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { settingsErrors } from '@settings/settings.errors';
import * as dummyRegistry from './dummy.registry.json';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CompanyApprovedEvent,
  CompanyDeniedEvent,
} from '@shared/events/company.event';
import { ROLES } from '@common/database/constants';

@Injectable()
export class CompanyService {
  constructor(
    private readonly fileHelpers: FileHelpers,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly requestContext: RequestContextService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updateCompanyKybDetails(data: any, files: Express.Multer.File[]) {
    if (this.requestContext.user!.company.isVerified) {
      throw new IBadRequestException({
        message: companyErrors.companyAlreadyVerified,
      });
    }

    const savedKybSettings = await this.settingsRepository.findOne({
      where: { name: 'kyb_settings' },
    });

    if (!savedKybSettings) {
      throw new IBadRequestException({
        message: settingsErrors.settingNotFound('kyb_settings'),
      });
    }

    const kybSettings: KybSettings = JSON.parse(
      Buffer.from(savedKybSettings.value).toString('utf-8'),
    );

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
    kybSettings.kybRequirements
      .filter((requirement) => requirement.type === KybDataTypes.STRING)
      .forEach((requirement) => {
        if (dataKeys.includes(requirement.name)) {
          validKybData[requirement.name] = data[requirement.name];
        }
      });

    const previousKybDetails = this.requestContext.user!.company.kybData
      ? JSON.parse(this.requestContext.user!.company.kybData)
      : {};

    files.forEach((file) => {
      validKybData[file.fieldname] = {
        file: file.buffer,
        fileName: file.originalname,
      };
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

    if (company.kybData) {
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

  verifyCompanyRC(rcNumber: string) {
    // TODO remove dummy registry
    const business = dummyRegistry.find(
      (business) => business.rcNumber === `RC${rcNumber}`,
    );

    if (!business) {
      throw new IBadRequestException({
        message: companyErrors.businessNotFoundOnRegistry(rcNumber),
      });
    }

    return ResponseFormatter.success(
      'Successfully fetched business details',
      business,
    );
  }

  async updateKYBstatus(
    companyId: string,
    { action, reason }: { action: 'approve' | 'deny'; reason?: string },
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    const companyAdmins = (await this.userRepository.find({
      where: {
        companyId: company.id,
        role: {
          slug: ROLES.ADMIN,
        },
      },
      relations: {
        profile: true,
      },
    })) as (User & { profile: Profile })[];

    switch (action) {
      case 'approve':
        await this.companyRepository.update(
          { id: companyId },
          { isVerified: true },
        );
        const event = new CompanyApprovedEvent(
          this.requestContext.user!,
          this.requestContext.user!,
          {
            admins: companyAdmins,
            apiProvider: this.requestContext.user!.company.name!,
          },
        );
        this.eventEmitter.emit(event.name, event);
        break;
      // Send mail to company with reason
      case 'deny':
        if (!reason) {
          throw new IBadRequestException({
            message: companyErrors.reasonNotProvided,
          });
        }
        const deniedEvent = new CompanyDeniedEvent(
          this.requestContext.user!,
          this.requestContext.user!,
          {
            admins: companyAdmins,
            reason: reason!,
          },
        );
        this.eventEmitter.emit(deniedEvent.name, deniedEvent);
      // Send message to company with reason
    }

    return ResponseFormatter.success(
      `Successfully ${action === 'approve' ? 'approved' : 'denied'} business.`,
    );
  }
}
