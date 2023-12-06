import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import { UpdateKybRequirementsDto } from './dto/index.dto';
import { KybSettings } from './types';
import { Settings } from '@common/database/entities';
import { Repository } from 'typeorm';
import { settingsErrors } from './settings.errors';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
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

    return ResponseFormatter.success(
      'KYB Requirements fetched successfully',
      kybSettings.kybRequirements,
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
}
