import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Injectable } from '@nestjs/common';
import { UpdateKybRequirementsDto } from './dto/index.dto';
import { readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { path } from 'app-root-path';
import { Settings } from './types';
// import * as settingsKybJson from '@common/config/settings.kyb.json';

@Injectable()
export class SettingsService {
  private kybSettings: Settings;

  onApplicationBootstrap() {
    this.kybSettings = JSON.parse(
      readFileSync(join(path, 'server.settings', 'settings.kyb.json'), 'utf-8'),
    );
  }

  getKybRequirements() {
    return ResponseFormatter.success(
      'KYB Requirements fetched successfully',
      this.kybSettings.kybRequirements,
    );
  }

  async updateKybRequirements({
    newKybRequirements,
    removedKybRequirements,
  }: UpdateKybRequirementsDto) {
    const cleanData: Settings['kybRequirements'] = [];

    const validRemovedRequirements: string[] = [];

    if (newKybRequirements) {
      newKybRequirements.forEach((requirement) => {
        if (
          !this.kybSettings.uneditableFields.includes(requirement.name) &&
          !this.kybSettings.kybRequirements.some(
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
        const existingRequirement = this.kybSettings.kybRequirements.find(
          (existingRequirement) => existingRequirement.name === requirement,
        );
        if (existingRequirement && existingRequirement.editable) {
          validRemovedRequirements.push(requirement);
        }
      });
    }

    const previousKybSettings = this.kybSettings.kybRequirements;

    const updatedKybSettings = [
      ...previousKybSettings.filter(
        (existingRequirement) =>
          !validRemovedRequirements.includes(existingRequirement.name),
      ),
      ...cleanData,
    ];

    console.log({ updatedKybSettings, cleanData });
    // console.log({ updatedKybSettings });

    writeFile(
      join(path, 'server.settings', 'settings.kyb.json'),
      JSON.stringify({
        ...this.kybSettings,
        kybRequirements: updatedKybSettings,
      }),
      () => {},
    );

    return ResponseFormatter.success('Updated KYB settings successfully');
  }
}
