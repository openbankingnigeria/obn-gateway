import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import {
  ApiKeyResponse,
  IPRestrictionRequest,
  IPRestrictionResponse,
  KybRequirementsResponse,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { KybSettings } from './types';
import { Settings } from '@common/database/entities';
import { Repository } from 'typeorm';
import { settingsErrors } from './settings.errors';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    private readonly kongConsumerService: KongConsumerService,
    private readonly requestContext: RequestContextService,
  ) {}

  async getKybRequirements() {
    const savedKybSettings = await this.settingsRepository.findOne({
      where: {
        name: 'kyb_settings',
      },
    });

    if (!savedKybSettings) {
      throw new IBadRequestException({
        message: settingsErrors.settingNotFound('kyb_settings'),
      });
    }

    const kybSettings: KybSettings = JSON.parse(savedKybSettings.value);

    console.log(kybSettings.kybRequirements);

    return ResponseFormatter.success(
      'KYB Requirements fetched successfully',
      kybSettings.kybRequirements.map(
        (kybRequirement) => new KybRequirementsResponse(kybRequirement),
      ),
    );
  }

  async updateKybRequirements({
    newKybRequirements,
    removedKybRequirements,
  }: UpdateKybRequirementsDto) {
    const cleanData: KybSettings['kybRequirements'] = [];

    const validRemovedRequirements: string[] = [];

    const savedKybSettings = await this.settingsRepository.findOne({
      where: {
        name: 'kyb_settings',
      },
    });

    if (!savedKybSettings) {
      throw new IBadRequestException({
        message: settingsErrors.settingNotFound('kyb_settings'),
      });
    }

    const kybSettings: KybSettings = JSON.parse(savedKybSettings.value);

    if (newKybRequirements) {
      newKybRequirements.forEach((requirement) => {
        if (
          !kybSettings.uneditableFields.includes(requirement.name) &&
          !kybSettings.kybRequirements.some(
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
        const existingRequirement = kybSettings.kybRequirements.find(
          (existingRequirement) => existingRequirement.name === requirement,
        );
        if (existingRequirement && existingRequirement.editable) {
          validRemovedRequirements.push(requirement);
        }
      });
    }

    const previousKybSettings = kybSettings.kybRequirements;

    const updatedKybSettings = [
      ...previousKybSettings.filter(
        (existingRequirement) =>
          !validRemovedRequirements.includes(existingRequirement.name),
      ),
      ...cleanData,
    ];

    await this.settingsRepository.update(
      { id: savedKybSettings.id },
      {
        value: JSON.stringify({
          ...kybSettings,
          kybRequirements: updatedKybSettings,
        }),
      },
    );

    return ResponseFormatter.success('Updated KYB settings successfully');
  }

  async getApiKey(environment: KONG_ENVIRONMENT) {
    const consumer = await this.kongConsumerService.getConsumer(
      environment,
      this.requestContext.user!.companyId,
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

  // TODO ensure that non development api key can only be generated for non development environment until company is approved
  async generateApiKey(environment: KONG_ENVIRONMENT) {
    const consumer = await this.kongConsumerService.updateOrCreateConsumer(
      environment,
      {
        custom_id: this.requestContext.user!.companyId,
      },
    );
    const consumerKey = await this.kongConsumerService.createConsumerKey(
      environment,
      consumer.id,
    );

    const consumerKeys = await this.kongConsumerService.getConsumerKeys(
      environment,
      consumer.id,
    );
    for (const existingKey of consumerKeys.data) {
      if (existingKey.id === consumerKey.id) continue;
      await this.kongConsumerService.deleteConsumerKey(
        environment,
        consumer.id,
        existingKey.id,
      );
    }

    return ResponseFormatter.success(
      'API Key generated successfully',
      new ApiKeyResponse({ key: consumerKey.key, environment }),
    );
  }

  async getIPRestriction(environment: KONG_ENVIRONMENT) {
    const consumer = await this.kongConsumerService.getConsumer(
      environment,
      this.requestContext.user!.companyId,
    );
    const consumerPlugins = await this.kongConsumerService.getPlugins(
      environment,
      consumer.id,
    );

    const consumerIPRestriction = consumerPlugins.data.find(
      (consumerPlugin) => consumerPlugin.name === KONG_PLUGINS.IP_RESTRICTION,
    );

    console.log({ consumerIPRestriction });

    return ResponseFormatter.success(
      'IP Restriction retrieved successfully',
      new IPRestrictionResponse({
        ips: consumerIPRestriction?.config?.allow || [],
        environment,
      }),
    );
  }

  async setIPRestriction(
    environment: KONG_ENVIRONMENT,
    data: IPRestrictionRequest,
  ) {
    const consumer = await this.kongConsumerService.updateOrCreateConsumer(
      environment,
      {
        custom_id: this.requestContext.user!.companyId,
      },
    );
    await this.kongConsumerService.updateOrCreatePlugin(
      environment,
      consumer.id,
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
}
