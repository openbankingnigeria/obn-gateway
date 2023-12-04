import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import * as settingsKybJson from './settings.kyb.json';
import { UpdateKybRequirementsDto } from './dto/index.dto';
import { writeFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class SettingsService {
  getKybRequirements() {
    return ResponseFormatter.success(
      'KYB Requirements fetched successfully',
      settingsKybJson.kybRequirements,
    );
  }

  updateKybRequirements({ kybRequirements }: UpdateKybRequirementsDto) {
    const cleanData: {
      name: string;
      label: string;
      type: string;
    }[] = [];

    kybRequirements.forEach((requirement) => {
      if (!settingsKybJson.uneditableFields.includes(requirement.name)) {
        cleanData.push(requirement);
      }
    });

    const previousKybSettings = settingsKybJson.kybRequirements;

    const updatedKybSettings = [...previousKybSettings, ...cleanData];

    writeFileSync(
      join(__dirname, 'settings.kyb.json'),
      JSON.stringify({
        ...settingsKybJson,
        kybRequirements: updatedKybSettings,
      }),
    );

    return ResponseFormatter.success('Updated KYB settings successfully');
  }
}
