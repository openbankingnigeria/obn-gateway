import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import {
  ApiKeyResponse,
  EmailTemplateDto,
  IPRestrictionRequest,
  IPRestrictionResponse,
  KybRequirementsResponse,
  UpdateCompanySubtypesRequest,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { CompanySubtypes, SETTINGS_TYPES, BusinessSettings } from './types';
import { Settings, Company } from '@common/database/entities';
import { Repository } from 'typeorm';
import { settingsErrors } from './settings.errors';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { BUSINESS_SETTINGS_NAME } from './settings.constants';
import { RequestContext } from '@common/utils/request/request-context';
import { CompanyTypes } from '@common/database/constants';
import { EmailTemplate } from '@common/database/entities/emailtemplate.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(EmailTemplate)
    private readonly emailTemplateRepository: Repository<EmailTemplate>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly kongConsumerService: KongConsumerService,
  ) {}

  async getKybRequirements() {
    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: BUSINESS_SETTINGS_NAME,
      },
    });

    if (!businessSettings) {
      throw new INotFoundException({
        message: settingsErrors.settingNotFound(BUSINESS_SETTINGS_NAME),
      });
    }

    const parsedBusinessSettings: BusinessSettings = JSON.parse(
      businessSettings.value,
    );

    return ResponseFormatter.success(
      'KYB Requirements fetched successfully',
      parsedBusinessSettings.kybRequirements.map(
        (kybRequirement) => new KybRequirementsResponse(kybRequirement),
      ),
    );
  }

  async updateKybRequirements(
    ctx: RequestContext,
    { newKybRequirements, removedKybRequirements }: UpdateKybRequirementsDto,
  ) {
    const cleanData: BusinessSettings['kybRequirements'] = [];

    const validRemovedRequirements: string[] = [];

    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: BUSINESS_SETTINGS_NAME,
      },
    });

    if (!businessSettings) {
      throw new INotFoundException({
        message: settingsErrors.settingNotFound(BUSINESS_SETTINGS_NAME),
      });
    }

    const parsedBusinessSettings: BusinessSettings = JSON.parse(
      businessSettings.value,
    );

    if (newKybRequirements) {
      newKybRequirements.forEach((requirement) => {
        if (
          !parsedBusinessSettings.uneditableFields.includes(requirement.name) &&
          !parsedBusinessSettings.kybRequirements.some(
            (existingRequirement) =>
              existingRequirement.name === requirement.name,
          )
        ) {
          cleanData.push({ ...requirement, editable: true });
        }
      });
    }

    if (removedKybRequirements) {
      removedKybRequirements.forEach((requirement) => {
        const existingRequirement = parsedBusinessSettings.kybRequirements.find(
          (existingRequirement) => existingRequirement.name === requirement,
        );
        if (existingRequirement && existingRequirement.editable) {
          validRemovedRequirements.push(requirement);
        }
      });
    }

    const previousKybSettings = parsedBusinessSettings.kybRequirements;

    const updatedKybSettings = [
      ...previousKybSettings.filter(
        (existingRequirement) =>
          !validRemovedRequirements.includes(existingRequirement.name),
      ),
      ...cleanData,
    ];

    await this.settingsRepository.update(
      { id: businessSettings.id },
      {
        value: JSON.stringify({
          ...parsedBusinessSettings,
          kybRequirements: updatedKybSettings,
        }),
      },
    );

    return ResponseFormatter.success('Updated KYB settings successfully');
  }

  async updateCompanySubTypes(
    ctx: RequestContext,
    {
      newCompanySubtypes,
      removedCompanySubtypes,
    }: UpdateCompanySubtypesRequest,
  ) {
    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: BUSINESS_SETTINGS_NAME,
      },
    });

    if (!businessSettings) {
      throw new INotFoundException({
        message: settingsErrors.settingNotFound(BUSINESS_SETTINGS_NAME),
      });
    }

    const parsedBusinessSettings: BusinessSettings = JSON.parse(
      businessSettings.value,
    );

    const prevCompanySubtypes = parsedBusinessSettings.companySubtypes || {
      business: [],
      individual: [],
      licensedEntity: [],
    };

    const updatedCompanySubtypes: CompanySubtypes = {
      [CompanyTypes.BUSINESS]: [],
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [],
    };

    if (newCompanySubtypes && Object.keys(newCompanySubtypes).length > 0) {
      Object.keys(newCompanySubtypes).forEach((companyType) => {
        if ((newCompanySubtypes as any)[companyType].length) {
          (updatedCompanySubtypes as any)[companyType] = [
            ...(prevCompanySubtypes as any)[companyType],
            ...(newCompanySubtypes as any)[companyType].filter(
              (subtype: string) =>
                !(prevCompanySubtypes as any)[companyType].includes(subtype),
            ),
          ];
        }
      });
    }

    Object.keys(removedCompanySubtypes).forEach((companyType) => {
      const existingCompanySubtypes: string[] = (prevCompanySubtypes as any)[
        companyType
      ];

      (updatedCompanySubtypes as any)[companyType] =
        existingCompanySubtypes.filter(
          (subtype) =>
            !(removedCompanySubtypes as any)[companyType].includes(subtype),
        );
    });

    await this.settingsRepository.update(
      { id: businessSettings.id },
      {
        value: JSON.stringify({
          ...businessSettings,
          companySubtypes: updatedCompanySubtypes,
        }),
      },
    );

    return ResponseFormatter.success('Updated company subtypes successfully');
  }

  async getApiKey(ctx: RequestContext, environment: KONG_ENVIRONMENT) {
    const consumer = await this.kongConsumerService.getConsumer(
      environment,
      ctx.activeCompany.id!,
    );
    const consumerKey = await this.kongConsumerService.getConsumerKeys(
      environment,
      consumer.id,
    );

    return ResponseFormatter.success(
      'API Key retrieved successfully',
      new ApiKeyResponse({
        key: consumerKey.data[0]?.key || null,
        environment,
      }),
    );
  }

  private async updateConsumerId(
    company: Company,
    environment: KONG_ENVIRONMENT,
  ) {
    // Update API provider consumer to allow access to route
    const response = await this.kongConsumerService.updateOrCreateConsumer(
      environment,
      {
        custom_id: company.id,
      },
    );

    await this.companyRepository.update(
      {
        id: company.id,
      },
      { consumerId: response.id },
    );

    await this.kongConsumerService.updateConsumerAcl(environment, {
      aclAllowedGroupName: `tier-${company.tier}`,
      consumerId: response.id,
    });

    return response.id;
  }

  // TODO ensure that non development api key can only be generated for non development environment until company is approved
  async generateApiKey(ctx: RequestContext, environment: KONG_ENVIRONMENT) {
    const consumerId =
      ctx.activeCompany.consumerId ||
      (await this.updateConsumerId(ctx.activeCompany, environment));

    const consumerKey = await this.kongConsumerService.createConsumerKey(
      environment,
      consumerId,
    );

    const consumerKeys = await this.kongConsumerService.getConsumerKeys(
      environment,
      consumerId,
    );
    for (const existingKey of consumerKeys.data) {
      if (existingKey.id === consumerKey.id) continue;
      await this.kongConsumerService.deleteConsumerKey(
        environment,
        consumerId,
        existingKey.id,
      );
    }

    return ResponseFormatter.success(
      'API Key generated successfully',
      new ApiKeyResponse({ key: consumerKey.key, environment }),
    );
  }

  async getIPRestriction(ctx: RequestContext, environment: KONG_ENVIRONMENT) {
    const consumer = await this.kongConsumerService.getConsumer(
      environment,
      ctx.activeCompany.id!,
    );
    const consumerPlugins = await this.kongConsumerService.getPlugins(
      environment,
      consumer.id,
    );

    const consumerIPRestriction = consumerPlugins.data.find(
      (consumerPlugin) => consumerPlugin.name === KONG_PLUGINS.IP_RESTRICTION,
    );

    return ResponseFormatter.success(
      'IP Restriction retrieved successfully',
      new IPRestrictionResponse({
        ips: consumerIPRestriction?.config?.allow || [],
        environment,
      }),
    );
  }

  async setIPRestriction(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    data: IPRestrictionRequest,
  ) {
    const consumerId =
      ctx.activeCompany.consumerId ||
      (await this.updateConsumerId(ctx.activeCompany, environment));

    await this.kongConsumerService.updateOrCreatePlugin(
      environment,
      consumerId,
      {
        name: KONG_PLUGINS.IP_RESTRICTION,
        enabled: true,
        config: { allow: data.ips },
      },
    );

    return ResponseFormatter.success(
      'IP Restriction set successfully',
      new IPRestrictionResponse({
        ips: data.ips,
        environment,
      }),
    );
  }

  async editSettings(
    ctx: RequestContext,
    settingType: SETTINGS_TYPES,
    data: any,
  ) {
    if (!Object.values(SETTINGS_TYPES).includes(settingType)) {
      throw new IBadRequestException({
        message: `Invalid settings type ${settingType}`,
      });
    }

    if (settingType === SETTINGS_TYPES.EMAIL_TEMPLATES) {
      const { body, title, temmplateId } = data as EmailTemplateDto;

      const template = await this.emailTemplateRepository.findOne({
        where: {
          id: temmplateId,
        },
      });

      if (!template) {
        throw new INotFoundException({
          message: 'Email template not found',
        });
      }

      const updateQuery: any = {};

      if (body) {
        updateQuery.body = body;
      }

      if (title) {
        updateQuery.title = title;
      }

      if (Object.keys(updateQuery).length > 0) {
        await this.emailTemplateRepository.update(
          { id: temmplateId },
          updateQuery,
        );
      }
    } else {
      const prevSettings = await this.settingsRepository.findOne({
        where: {
          name: settingType,
        },
      });

      if (!prevSettings) {
        throw new INotFoundException({
          message: settingsErrors.settingNotFound(settingType),
        });
      }

      const settingsValue = JSON.parse(prevSettings.value);

      if (!settingsValue) {
        throw new INotFoundException({
          message: settingsErrors.settingNotFound(settingType),
        });
      }

      for (const field of Object.keys(data)) {
        if (settingsValue[field]) {
          settingsValue[field].value = data[field];
        }
      }

      await this.settingsRepository.update(
        {
          name: settingType,
        },
        { value: JSON.stringify(settingsValue) },
      );
    }

    return ResponseFormatter.success('System settings updated successfully.');
  }

  async viewSettings(settingType: SETTINGS_TYPES) {
    if (!Object.values(SETTINGS_TYPES).includes(settingType)) {
      throw new IBadRequestException({
        message: `Invalid settings type ${settingType}`,
      });
    }
    if (settingType === SETTINGS_TYPES.EMAIL_TEMPLATES) {
      let templates = await this.emailTemplateRepository.find();

      templates = templates.map((template) => ({
        ...template,
        body: Buffer.from(template.body).toString('utf-8'),
      }));

      return ResponseFormatter.success(
        'Email templates retrieved successfully',
        templates,
      );
    } else {
      const prevSettings = await this.settingsRepository.findOne({
        where: {
          name: settingType,
        },
      });

      if (!prevSettings) {
        throw new INotFoundException({
          message: settingsErrors.settingNotFound(settingType),
        });
      }

      const settingsValue = JSON.parse(prevSettings.value);

      if (!settingsValue) {
        throw new INotFoundException({
          message: settingsErrors.settingNotFound(settingType),
        });
      }

      return ResponseFormatter.success(
        'System settings fetched successfully.',
        settingsValue,
      );
    }
  }
}
