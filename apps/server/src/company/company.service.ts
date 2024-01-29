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
  Settings,
  User,
} from '@common/database/entities';
import { Repository } from 'typeorm';
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
  GetCompanyCustomFieldsResponseDTO,
  GetCompanyResponseDTO,
  GetCompanySubTypesResponseDTO,
  GetCompanyTypesResponseDTO,
  GetStatsDto,
  GetStatsResponseDTO,
  PrimaryUserDto,
  ProfileDto,
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
    private readonly eventEmitter: EventEmitter2,
    private readonly kongConsumerService: KongConsumerService,
    private readonly config: ConfigService,
  ) {}

  async updateCompanyKybDetails(
    ctx: RequestContext,
    data: any,
    files: Express.Multer.File[],
  ) {
    if (ctx.activeCompany.kybStatus === 'approved') {
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
      where: { name: BUSINESS_SETTINGS_NAME },
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

    const previousKybDetails = ctx.activeCompany.kybData
      ? JSON.parse(ctx.activeCompany.kybData)
      : {};

    files.forEach((file) => {
      validKybData[file.fieldname] = {
        file: file.buffer,
        fileName: file.originalname,
      };
    });

    await this.companyRepository.update(
      { id: ctx.activeCompany.id },
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
  async getCompanyDetails(ctx: RequestContext, companyId?: string) {
    const company = companyId
      ? await this.companyRepository.findOne({
          where: { id: companyId },
          relations: { primaryUser: { profile: true } },
        })
      : ctx.activeCompany;

    if (!company) {
      throw new INotFoundException({
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
        primaryUser: new PrimaryUserDto({
          ...company.primaryUser,
          profile: new ProfileDto(company.primaryUser?.profile),
        }),
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
    ctx: RequestContext,
    companyId: string,
    { action, reason }: UpdateKybStatusDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: companyId,
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
      businessDetails = this.verifyCompanyRC(company.rcNumber, company.name);
    }

    let event: CompanyDeniedEvent | CompanyApprovedEvent;

    switch (action) {
      case 'approve':
        if (company.consumerId) {
          for (const environment in this.config.get<Record<KONG_ENVIRONMENT, string>>(
            'kong.endpoint',
          )) {
            if (environment === KONG_ENVIRONMENT.DEVELOPMENT) continue
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
            kybStatus: 'approved',
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
          for (const environment in this.config.get<Record<KONG_ENVIRONMENT, string>>(
            'kong.endpoint',
          )) {
            if (environment === KONG_ENVIRONMENT.DEVELOPMENT) continue
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
            kybStatus: 'denied',
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
        name: BUSINESS_SETTINGS_NAME,
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
        id: companyId,
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
      for (const environment in this.config.get<Record<KONG_ENVIRONMENT, string>>(
        'kong.endpoint',
      )) {
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

  async getCompaniesStats(ctx: RequestContext, query: GetStatsDto) {
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
        query.filter.createdAt.gt || null,
        query.filter.createdAt.gt || null,
        query.filter.createdAt.lt || null,
        query.filter.createdAt.lt || null,
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
