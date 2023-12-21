import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { companyErrors } from './company.errors';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { KybDataTypes, SystemSettings } from '@settings/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Company, Settings, User } from '@common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from '@common/utils/request/request-context.service';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { settingsErrors } from '@settings/settings.errors';
import * as dummyRegistry from './dummy.registry.json';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CompanyApprovedEvent,
  CompanyDeniedEvent,
} from '@shared/events/company.event';
import {
  GetCompanyResponseDTO,
  GetCompanySubTypesResponseDTO,
  GetCompanyTypesResponseDTO,
  UpdateCompanyKybStatusResponseDTO,
  UpdateKybStatusDto,
} from './dto/index.dto';
import { SYSTEM_SETTINGS_NAME } from '@settings/settings.constants';
import { CompanyTypes } from '@common/database/constants';

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

    if (data.rcNumber) {
      const rcExists = await this.companyRepository.count({
        where: {
          rcNumber: data.rcNumber,
        },
      });

      if (rcExists > 0) {
        throw new IBadRequestException({
          message: `A business with RC Number - ${data.rcNumber} already exists.`,
        });
      }
    }

    const savedKybSettings = await this.settingsRepository.findOne({
      where: { name: SYSTEM_SETTINGS_NAME },
    });

    if (!savedKybSettings) {
      throw new IBadRequestException({
        message: settingsErrors.settingNotFound(SYSTEM_SETTINGS_NAME),
      });
    }

    const systemSettings: SystemSettings = JSON.parse(
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
    systemSettings.kybRequirements
      .filter((requirement) => requirement.type === KybDataTypes.STRING)
      .forEach((requirement) => {
        if (dataKeys.includes(requirement.name)) {
          if (
            requirement.length &&
            data[requirement.name].length > requirement.length
          ) {
            throw new IBadRequestException({
              message: `${requirement.name} cannot be longer than ${requirement.length} characters.`,
            });
          }
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
        rcNumber: data.rcNumber,
      },
    );

    return ResponseFormatter.success(
      'Successfully updated company KYB details.',
    );
  }

  // TODO ensure only APs can get any company details like this.
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

    return ResponseFormatter.success(
      'Successfully fetched company details',
      new GetCompanyResponseDTO({
        ...company,
        kybData: kybDetails,
      }),
    );
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
        subtype: true,
        tier: true,
        isVerified: true,
        deletedAt: true,
        id: true,
      },
    });

    return ResponseFormatter.success(
      'Successfully fetched company',
      companies.map((company) => new GetCompanyResponseDTO(company)),
      new ResponseMetaDTO({
        totalNumberOfRecords: totalCompanies,
        totalNumberOfPages: Math.ceil(totalCompanies / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  verifyCompanyRC(rcNumber: string, name?: string) {
    if (!name) {
      throw new IBadRequestException({
        message: 'Company name is empty',
      });
    }
    // TODO remove dummy registry
    const business = dummyRegistry.find(
      (business) => business.rcNumber === rcNumber,
    );

    if (!business) {
      throw new IBadRequestException({
        message: companyErrors.businessNotFoundOnRegistry(rcNumber),
      });
    }
    const nameMatches = business.name === name;

    if (!nameMatches) {
      throw new IBadRequestException({
        message: `RC Number does not match business name`,
      });
    }

    return business;
  }

  async updateKYBStatus(
    companyId: string,
    { action, reason }: UpdateKybStatusDto,
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

    if (!company.rcNumber) {
      throw new IBadRequestException({
        message: 'RC Number is yet to be provided',
      });
    }

    const businessDetails = this.verifyCompanyRC(
      company.rcNumber,
      company.name,
    );

    switch (action) {
      case 'approve':
        await this.companyRepository.update(
          { id: companyId },
          { isVerified: true, tier: businessDetails.tier },
        );
        const event = new CompanyApprovedEvent(
          this.requestContext.user!,
          company,
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
          company,
          {
            reason: reason!,
          },
        );
        this.eventEmitter.emit(deniedEvent.name, deniedEvent);
    }

    return ResponseFormatter.success(
      `Successfully ${action === 'approve' ? 'approved' : 'denied'} business.`,
      new UpdateCompanyKybStatusResponseDTO({ tier: businessDetails.tier }),
    );
  }

  async getCompanyTypes() {
    const companyTypes = Object.values(CompanyTypes).filter(
      (type) => type !== CompanyTypes.API_PROVIDER,
    );

    const systemSettings = await this.settingsRepository.findOne({
      where: {
        name: SYSTEM_SETTINGS_NAME,
      },
    });

    if (!systemSettings) {
      throw new IBadRequestException({ message: 'System settings not found.' });
    }

    const parsedSystemSettings: SystemSettings = JSON.parse(
      systemSettings.value,
    );

    const companySubtypes = parsedSystemSettings.companySubtypes || {
      business: [],
      individual: [],
      licensedEntity: [],
    };

    return ResponseFormatter.success(
      'Company types fetched successfully',
      new GetCompanyTypesResponseDTO({
        companySubtypes: new GetCompanySubTypesResponseDTO(companySubtypes),
        companyTypes,
      }),
    );
  }
}
