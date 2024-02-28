import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { companyErrors } from './company.errors';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { KybDataTypes, BusinessSettings } from '@settings/types';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Company,
  CompanyStatuses,
  KybStatuses,
  Settings,
  User,
} from '@common/database/entities';
import { Equal, Repository } from 'typeorm';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { settingsErrors } from '@settings/settings.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CompanyApprovedEvent,
  CompanyDeniedEvent,
} from '@shared/events/company.event';
import {
  GetCompanyCustomFieldsResponseDTO,
  GetCompanyKYBDataResponseDTO,
  GetCompanyResponseDTO,
  GetCompanySubTypesResponseDTO,
  GetCompanyTypesResponseDTO,
  GetStatsDto,
  GetStatsResponseDTO,
  PrimaryUserDto,
  UpdateCompanyKybStatusResponseDTO,
  UpdateKybStatusDto,
} from './dto/index.dto';
import { BUSINESS_SETTINGS_NAME } from '@settings/settings.constants';
import { CompanyTypes } from '@common/database/constants';
import { companyCustomFields } from './company.constants';
import { RequestContext } from '@common/utils/request/request-context';
import * as moment from 'moment';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { ConfigService } from '@nestjs/config';
import { CompanyTiers } from './types';
import { CompanyKybData } from '@common/database/entities/company-kyb.entity';

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
    @InjectRepository(CompanyKybData)
    private readonly companyKybDataRepository: Repository<CompanyKybData>,
    private readonly eventEmitter: EventEmitter2,
    private readonly kongConsumerService: KongConsumerService,
    private readonly config: ConfigService,
  ) {}

  async updateCompanyKybDetails(
    ctx: RequestContext,
    data: any,
    files: Express.Multer.File[],
  ) {
    if (ctx.activeCompany.kybStatus === KybStatuses.APPROVED) {
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

    if (data.accountNumber) {
      const rcExists = await this.userRepository.count({
        where: {
          accountNumber: data.accountNumber,
        },
      });

      if (rcExists > 0) {
        throw new IBadRequestException({
          message: `A business with account number - ${data.accountNumber} already exists.`,
        });
      }
    }

    const savedKybSettings = await this.settingsRepository.findOne({
      where: { name: Equal(BUSINESS_SETTINGS_NAME) },
    });

    if (!savedKybSettings) {
      throw new IBadRequestException({
        message: settingsErrors.settingNotFound(BUSINESS_SETTINGS_NAME),
      });
    }

    const businessSettings: BusinessSettings = JSON.parse(
      Buffer.from(savedKybSettings.value).toString('utf-8'),
    );

    // If a file is uploaded is present, validate image size
    if (Object.keys(files).length) {
      const { isFileTypeValid, maxFileSize, isSizeValid } =
        this.fileHelpers.validateFile(files);

      if (!isFileTypeValid) {
        throw new IBadRequestException({
          message: companyErrors.invalidFileType,
        });
      }

      if (!isSizeValid) {
        throw new IBadRequestException({
          message: companyErrors.fileTooLarge(maxFileSize),
        });
      }
    }

    const dataKeys = Object.keys(data);
    const validKybData: Record<
      string,
      { file: Buffer; fileName: string; fileMimeType: string } | string
    > = {};

    // Select only valid fields from the request payload
    businessSettings.kybRequirements
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

    let kybData = await this.companyKybDataRepository.findOne({
      where: {
        id: Equal(ctx.activeCompany.kybDataId!),
      },
    });

    const previousKybDetails = kybData?.data ? JSON.parse(kybData?.data) : {};

    files.forEach((file) => {
      validKybData[file.fieldname] = {
        file: file.buffer,
        fileName: file.originalname,
        fileMimeType: file.mimetype,
      };
    });

    if (!kybData) {
      kybData = await this.companyKybDataRepository.save({
        companyId: ctx.activeCompany.id,
        data: JSON.stringify({ ...previousKybDetails, ...validKybData }),
      });
    } else {
      await this.companyKybDataRepository.update(
        { id: kybData.id },
        {
          data: JSON.stringify({ ...previousKybDetails, ...validKybData }),
        },
      );
    }

    await this.companyRepository.update(
      { id: ctx.activeCompany.id, kybDataId: kybData.id },
      {
        rcNumber: data.rcNumber,
        kybStatus: KybStatuses.PENDING,
      },
    );

    await this.userRepository.update(
      { id: ctx.activeUser.id },
      {
        accountNumber: data.accountNumber,
      },
    );

    return ResponseFormatter.success(
      'Successfully updated company KYB details.',
    );
  }

  // TODO ensure only APs can get any company details like this.
  async getCompanyDetails(ctx: RequestContext, companyId?: string) {
    const company = companyId
      ? await this.companyRepository.findOne({
          where: { id: Equal(companyId) },
          relations: { primaryUser: { profile: true } },
        })
      : ctx.activeCompany;

    if (!company) {
      throw new INotFoundException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    const companyKybData = await this.companyKybDataRepository.findOne({
      where: { id: Equal(company.kybDataId!) },
    });

    const kybDetails: any = {};

    if (companyKybData?.data) {
      const kybData = JSON.parse(companyKybData.data);
      for (const key of Object.keys(kybData)) {
        if (typeof kybData![key] === 'string') {
          kybDetails[key] = kybData![key];
        } else {
          const fileObject = kybData![key] as {
            file: Buffer;
            fileName: string;
            fileMimeType: string;
          };
          const fileMap = new Map();

          fileMap.set('fileName', fileObject.fileName);
          fileMap.set('fileMimeType', fileObject.fileMimeType);
          fileMap.set('file', Buffer.from(fileObject.file).toString('base64'));
          kybDetails[key] = fileMap;
        }
      }
    }

    return ResponseFormatter.success(
      'Successfully fetched company details',
      new GetCompanyKYBDataResponseDTO({
        ...company,
        primaryUser: new PrimaryUserDto(company.primaryUser!),
        kybData: kybDetails,
      }),
    );
  }

  // TODO is this for APs?
  async listCompanies(
    ctx: RequestContext,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
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
        kybStatus: true,
        status: true,
        deletedAt: true,
        id: true,
        primaryUser: {
          bvn: true,
          email: true,
          profile: {
            firstName: true,
            lastName: true,
          },
        },
      },
      relations: {
        primaryUser: { profile: true },
      },
    });

    return ResponseFormatter.success(
      'Successfully fetched company',
      companies.map(
        (company) =>
          new GetCompanyResponseDTO({
            ...company,
            primaryUser: new PrimaryUserDto(company.primaryUser!),
          }),
      ),
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

    // Determine the tier depending on the rc Number
    const firstFour = Number(rcNumber.slice(0, 5));

    let tier: CompanyTiers;

    if (firstFour > 75000) {
      tier = CompanyTiers.TIER_3;
    } else if (firstFour > 50000) {
      tier = CompanyTiers.TIER_2;
    } else if (firstFour > 25000) {
      tier = CompanyTiers.TIER_1;
    } else {
      tier = CompanyTiers.TIER_0;
    }

    return {
      rcNumber,
      tier,
    };
  }

  // TODO throw an error if updating to current status
  async updateKYBStatus(
    ctx: RequestContext,
    companyId: string,
    { action, reason }: UpdateKybStatusDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: Equal(companyId),
      },
    });

    if (!company) {
      throw new INotFoundException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    if (!company.rcNumber && company.type === CompanyTypes.LICENSED_ENTITY) {
      throw new IBadRequestException({
        message: 'RC Number is yet to be provided',
      });
    }

    // TODO lets stick with a nomenclature, we currently have mixes of business and company
    if (company.status !== CompanyStatuses.ACTIVE) {
      throw new IBadRequestException({
        message: `Cannot ${action} ${company.status} business`,
      });
    }

    let businessDetails: {
      rcNumber?: string;
      name?: string;
      tier?: string;
    } = { name: company.name };

    if (company.rcNumber && company.type === CompanyTypes.LICENSED_ENTITY) {
      // create tier in ACL for consumer
      businessDetails = this.verifyCompanyRC(company.rcNumber, company.name);
    }

    let event: CompanyDeniedEvent | CompanyApprovedEvent;

    switch (action) {
      case 'approve':
        if (company.consumerId) {
          for (const environment in this.config.get<
            Record<KONG_ENVIRONMENT, string>
          >('kong.adminEndpoint')) {
            if (environment === KONG_ENVIRONMENT.DEVELOPMENT) continue;
            await this.kongConsumerService.updateOrCreatePlugin(
              environment as KONG_ENVIRONMENT,
              company.consumerId,
              {
                name: KONG_PLUGINS.REQUEST_TERMINATION,
                enabled: false,
              },
            );
          }
        }
        await this.companyRepository.update(
          { id: companyId },
          {
            isVerified: true,
            tier: businessDetails?.tier,
            kybStatus: KybStatuses.APPROVED,
          },
        );
        event = new CompanyApprovedEvent(ctx.activeUser, company);
        this.eventEmitter.emit(event.name, event);
        break;
      // Send mail to company with reason
      case 'deny':
        if (!reason) {
          throw new IBadRequestException({
            message: companyErrors.reasonNotProvided,
          });
        }
        if (company.consumerId) {
          for (const environment in this.config.get<
            Record<KONG_ENVIRONMENT, string>
          >('kong.adminEndpoint')) {
            if (environment === KONG_ENVIRONMENT.DEVELOPMENT) continue;
            await this.kongConsumerService.updateOrCreatePlugin(
              environment as KONG_ENVIRONMENT,
              company.consumerId,
              {
                name: KONG_PLUGINS.REQUEST_TERMINATION,
                enabled: true,
              },
            );
          }
        }
        await this.companyRepository.update(
          { id: companyId },
          {
            kybStatus: KybStatuses.DENIED,
          },
        );
        event = new CompanyDeniedEvent(ctx.activeUser, company, {
          reason: reason,
        });
        this.eventEmitter.emit(event.name, event);
    }

    return ResponseFormatter.success(
      `Successfully ${action === 'approve' ? 'approved' : 'denied'} business.`,
      new UpdateCompanyKybStatusResponseDTO({ tier: businessDetails?.tier }),
    );
  }

  async getCompanyTypes() {
    const companyTypes = Object.values(CompanyTypes).filter(
      (type) => type !== CompanyTypes.API_PROVIDER,
    );

    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: Equal(BUSINESS_SETTINGS_NAME),
      },
    });

    if (!businessSettings) {
      throw new IBadRequestException({ message: 'System settings not found.' });
    }

    const parsedBusinessSettings: BusinessSettings = JSON.parse(
      businessSettings.value,
    );

    const companySubtypes = parsedBusinessSettings.companySubtypes || {
      [CompanyTypes.BUSINESS]: [],
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [],
    };

    return ResponseFormatter.success(
      'Company types fetched successfully',
      new GetCompanyTypesResponseDTO({
        companySubtypes: new GetCompanySubTypesResponseDTO(companySubtypes),
        companyTypes,
      }),
    );
  }

  async getCompanyCustomFields(companyType: CompanyTypes) {
    let customFields: Record<string, { type: string; label: string }> = {};

    switch (companyType) {
      case CompanyTypes.BUSINESS:
        customFields = companyCustomFields.business;
        break;
      case CompanyTypes.INDIVIDUAL:
        customFields = companyCustomFields.individual;
        break;
      case CompanyTypes.LICENSED_ENTITY:
        customFields = companyCustomFields['licensed-entity'];
        break;
    }

    return ResponseFormatter.success(
      'Company custom fields fetched successfully',
      new GetCompanyCustomFieldsResponseDTO(customFields),
    );
  }

  async toggleCompanyAccess(
    ctx: RequestContext,
    companyId: string,
    isActive: boolean,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: Equal(companyId),
      },
    });

    if (!company) {
      throw new INotFoundException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    if (company.status === CompanyStatuses.ACTIVE && isActive) {
      throw new IBadRequestException({
        message: `Cannot set company access to active because company is already active`,
      });
    }

    if (company.status === CompanyStatuses.INACTIVE && !isActive) {
      throw new IBadRequestException({
        message: `Cannot set company access to inactive because company is already inactive`,
      });
    }

    if (company.consumerId) {
      for (const environment in this.config.get<
        Record<KONG_ENVIRONMENT, string>
      >('kong.adminEndpoint')) {
        await this.kongConsumerService.updateOrCreatePlugin(
          environment as KONG_ENVIRONMENT,
          company.consumerId,
          {
            name: KONG_PLUGINS.REQUEST_TERMINATION,
            enabled: !isActive,
          },
        );
      }
    }

    await this.companyRepository.update(
      {
        id: company.id,
      },
      {
        status: isActive ? CompanyStatuses.ACTIVE : CompanyStatuses.INACTIVE,
      },
    );

    return ResponseFormatter.success(
      `Successfully ${isActive ? 'activated' : 'deactivated'} business.`,
    );
  }

  async getCompaniesStats(ctx: RequestContext, query?: GetStatsDto) {
    const stats = await this.userRepository.query(
      `SELECT IFNULL(count(companies.id), 0) count, definitions.value
    FROM
    companies
    RIGHT OUTER JOIN (${Object.values(CompanyStatuses)
      .map((status) => `SELECT '${status}' AS \`key\`, '${status}' AS value`)
      .join(' UNION ')}) definitions ON companies.status = definitions.key
        AND companies.deleted_at IS NULL AND (companies.created_at >= ? OR ? IS NULL) AND (companies.created_at < ? OR ? IS NULL)
    GROUP BY
      definitions.value
        `,
      [
        query?.filter.createdAt.gt || null,
        query?.filter.createdAt.gt || null,
        query?.filter.createdAt.lt || null,
        query?.filter.createdAt.lt || null,
      ],
    );
    return ResponseFormatter.success<GetStatsResponseDTO[]>(
      'Company stats fetched successfully',
      stats.map(
        (stat: { count: number; value: string }) =>
          new GetStatsResponseDTO(stat),
      ),
    );
  }

  async getCompaniesKybStats(ctx: RequestContext, query?: GetStatsDto) {
    const stats = await this.userRepository.query(
      `SELECT IFNULL(count(companies.id), 0) count, definitions.value
    FROM
    companies
    RIGHT OUTER JOIN (${Object.values(KybStatuses)
      .map((status) => `SELECT '${status}' AS \`key\`, '${status}' AS value`)
      .join(' UNION ')}) definitions ON companies.kyb_status = definitions.key
        AND companies.deleted_at IS NULL AND (companies.created_at >= ? OR ? IS NULL) AND (companies.created_at < ? OR ? IS NULL)
    GROUP BY
      definitions.value
        `,
      [
        query?.filter.createdAt.gt || null,
        query?.filter.createdAt.gt || null,
        query?.filter.createdAt.lt || null,
        query?.filter.createdAt.lt || null,
      ],
    );
    return ResponseFormatter.success<GetStatsResponseDTO[]>(
      'Company stats fetched successfully',
      stats.map(
        (stat: { count: number; value: string }) =>
          new GetStatsResponseDTO(stat),
      ),
    );
  }

  async getCompaniesStatsAggregate(ctx: RequestContext, query: GetStatsDto) {
    const aggregates = [];
    const stats = await this.getCompaniesStats(ctx, query);
    for (const stat of stats.data!) {
      const stats = await this.userRepository.query(
        `WITH RECURSIVE date_series AS (
            SELECT ? AS date UNION ALL
            SELECT DATE_ADD(date, INTERVAL 1 DAY)
            FROM date_series WHERE date < ?
          )
      SELECT
        date_series.date value, COALESCE(COUNT(companies.created_at), 0) count
      FROM
        date_series LEFT JOIN companies ON date_series.date = DATE(companies.created_at) AND companies.status = ?
        GROUP BY date_series.date ORDER BY date_series.date`,
        [
          query.filter.createdAt.gt
            ? moment(query.filter.createdAt.gt).format('YYYY-MM-DD')
            : moment(query.filter.createdAt.lt)
                .subtract(30, 'days')
                .format('YYYY-MM-DD'),
          moment(query.filter.createdAt.lt).format('YYYY-MM-DD'),
          stat.value,
        ],
      );
      aggregates.push({
        ...stat,
        data: stats,
      });
    }

    return ResponseFormatter.success<GetStatsResponseDTO[]>(
      'Company stats fetched successfully',
      aggregates.map((stat) => new GetStatsResponseDTO(stat)),
    );
  }
}
