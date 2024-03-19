import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import { isString } from 'class-validator';
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
import { Settings, Company, EmailTemplate } from '@common/database/entities';
import { Equal, Repository } from 'typeorm';
import { settingsErrors } from './settings.errors';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import {
  BUSINESS_SETTINGS_NAME,
  defaultBusinessSettings,
} from './settings.constants';
import { RequestContext } from '@common/utils/request/request-context';
import { CompanyTypes } from '@common/database/constants';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  EditSettingsEvent,
  GenerateApiKeyEvent,
  GetApiKeyEvent,
  SetIPRestrictionEvent,
  UpdateCompanySubtypesEvent,
  UpdateKybRequirementsEvent,
} from '@shared/events/settings.event';

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
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getKybRequirements() {
    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: Equal(BUSINESS_SETTINGS_NAME),
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
        name: Equal(BUSINESS_SETTINGS_NAME),
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

    const event = new UpdateKybRequirementsEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success('Updated KYB settings successfully');
  }

  structureCompanySubtypes(
    prevData: any,
    newData: any,
    category: CompanyTypes,
  ) {
    const updatedData = newData[category].map((subtype: any) => {
      return {
        value: subtype,
        default: !!prevData[category].find(
          (existing: any) =>
            existing.value.trim().toLowerCase().replace(/\W/gi, '-') ===
            subtype.trim().toLowerCase().replace(/\W/gi, '-'),
        )?.default,
      };
    });

    return updatedData;
  }

  async updateCompanySubTypes(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ctx: RequestContext,
    data: UpdateCompanySubtypesRequest,
  ) {
    const businessSettings = await this.settingsRepository.findOne({
      where: {
        name: Equal(BUSINESS_SETTINGS_NAME),
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
      [CompanyTypes.BUSINESS]: [],
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [],
    };

    let hasRestrictedValues = false;
    const restrictedCompanySubtypes = {
      [CompanyTypes.BUSINESS]: [],
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [],
    };

    let hasExistingValues = false;
    const existingCompanySubtypes = {
      [CompanyTypes.BUSINESS]: [],
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [],
    };

    // Validate removal request
    Object.keys(data).forEach((key) => {
      const valuesToRemove: { value: string; default: boolean }[] = (
        prevCompanySubtypes as any
      )[key].filter(
        (subType: { value: string; default: boolean }) =>
          !(data as any)[key]
            .map((subType: string) =>
              subType.trim().toLowerCase().replace(/\W/gi, '-'),
            )
            .includes(subType.value.trim().toLowerCase().replace(/\W/gi, '-')),
      );

      const defaultBusinessSettingsValues: {
        value: string;
        default: boolean;
      }[] = (defaultBusinessSettings.companySubtypes as any)[key];

      const restrictedValues: any = defaultBusinessSettingsValues.filter(
        (subtype) =>
          valuesToRemove
            .map((subtype) =>
              subtype.value.trim().toLowerCase().replace(/\W/gi, '-'),
            )
            .includes(subtype.value.trim().toLowerCase().replace(/\W/gi, '-')),
      );

      if (restrictedValues.length > 0) {
        hasRestrictedValues = true;
      }

      (restrictedCompanySubtypes as any)[key] = restrictedValues;
    });

    // Validate addition request
    Object.keys(data).forEach((key) => {
      const keysCount: { originalName: string; name: string }[] = [];
      (data as any)[key].forEach((value: string) => {
        if (
          keysCount.some(
            (key) =>
              key.name === value.trim().toLowerCase().replace(/\W/gi, '-'),
          )
        ) {
          hasExistingValues = true;
          (existingCompanySubtypes as any)[key].push(value);
        } else {
          keysCount.push({
            originalName: value,
            name: value.trim().toLowerCase().replace(/\W/gi, '-'),
          });
        }
      });
    });

    if (hasRestrictedValues) {
      throw new IBadRequestException({
        message: 'Cannot change default values',
        data: restrictedCompanySubtypes,
      });
    }

    if (hasExistingValues) {
      throw new IBadRequestException({
        message: 'Cannot add values because they already exist.',
        data: existingCompanySubtypes,
      });
    }

    const updatedCompanySubtypes: CompanySubtypes = {
      [CompanyTypes.BUSINESS]: this.structureCompanySubtypes(
        prevCompanySubtypes,
        data,
        CompanyTypes.BUSINESS,
      ),
      [CompanyTypes.INDIVIDUAL]: this.structureCompanySubtypes(
        prevCompanySubtypes,
        data,
        CompanyTypes.INDIVIDUAL,
      ),
      [CompanyTypes.LICENSED_ENTITY]: this.structureCompanySubtypes(
        prevCompanySubtypes,
        data,
        CompanyTypes.LICENSED_ENTITY,
      ),
    };

    await this.settingsRepository.update(
      { id: businessSettings.id },
      {
        value: JSON.stringify({
          ...parsedBusinessSettings,
          companySubtypes: updatedCompanySubtypes,
        }),
      },
    );

    const event = new UpdateCompanySubtypesEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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

    const event = new GetApiKeyEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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

    if (company.tier) {
      // TODO optimize
      await this.kongConsumerService
        .updateConsumerAcl(environment, {
          aclAllowedGroupName: `tier-${company.tier}`,
          consumerId: response.id,
        })
        .catch(console.error);
    }

    return response.id;
  }

  async generateApiKey(ctx: RequestContext, environment: KONG_ENVIRONMENT) {
    const consumerId = await this.updateConsumerId(
      ctx.activeCompany,
      environment,
    );

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

    const event = new GenerateApiKeyEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
    const consumerId = await this.updateConsumerId(
      ctx.activeCompany,
      environment,
    );

    await this.kongConsumerService.updateOrCreatePlugin(
      environment,
      consumerId,
      {
        name: KONG_PLUGINS.IP_RESTRICTION,
        enabled: true,
        config: { allow: data.ips },
      },
    );

    const event = new SetIPRestrictionEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
          id: Equal(temmplateId),
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
    } else if (settingType === SETTINGS_TYPES.ONBOARDING_CUSTOM_FIELDS) {
      const errors: any = {};
      // Validate the data
      Object.values(data).forEach(
        (
          value: Record<
            string,
            { label: string; type: 'email' | 'password' | 'text' | 'dropdown' }
          >,
        ) => {
          const innerKeys = Object.keys(value);

          innerKeys.forEach((innerKey) => {
            if (
              !['email', 'password', 'text', 'dropdown'].includes(
                value[innerKey].type,
              ) ||
              !isString(value[innerKey].label)
            ) {
              errors[innerKey] = ![
                'email',
                'password',
                'text',
                'dropdown',
              ].includes(value[innerKey].type)
                ? `${innerKey} must have a value of 'email', 'password', 'text' or 'dropdown'`
                : `${innerKey} must be a string`;
            }
          });
        },
      );

      if (Object.keys(errors).length > 0) {
        throw new IBadRequestException({
          data: errors,
          message: 'Validation Error.',
        });
      }

      const prevSettings = await this.settingsRepository.findOne({
        where: {
          name: Equal(settingType),
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
          settingsValue[field] = { ...settingsValue[field], ...data[field] };
        }
      }

      await this.settingsRepository.update(
        {
          name: settingType,
        },
        { value: JSON.stringify(settingsValue) },
      );
    } else {
      const prevSettings = await this.settingsRepository.findOne({
        where: {
          name: Equal(settingType),
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

    const event = new EditSettingsEvent(ctx.activeUser, { settingType });
    this.eventEmitter.emit(event.name, event);

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
          name: Equal(settingType),
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
