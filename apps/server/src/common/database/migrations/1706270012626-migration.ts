import {
  GeneralSettingsInterface,
  SETTINGS_TYPES,
} from '../../../settings/types';
import {
  BUSINESS_SETTINGS_NAME,
  defaultBusinessSettings,
} from '../../../settings/settings.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const defaultGeneralSettings: GeneralSettingsInterface = {
  authTokenExpirationDuration: {
    type: 'time',
    unit: 'secs',
    value: 30,
  },
  failedLoginAttempts: {
    type: 'count',
    value: 30,
  },
  inactivityTimeout: {
    type: 'time',
    unit: 'mins',
    value: 5,
  },
  invitationTokenExpirationDuration: {
    type: 'time',
    unit: 'mins',
    value: 30,
  },
  passwordResetTokenExpirationDuration: {
    type: 'time',
    unit: 'mins',
    value: 10,
  },
  requestTimeout: {
    type: 'time',
    unit: 'secs',
    value: 30,
  },
  twoFaExpirationDuration: {
    type: 'time',
    unit: 'mins',
    value: 10,
  },
};

export class Migration1706270012626 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const parameters = [
      [
        uuidv4(),
        SETTINGS_TYPES.GENERAL_SETTINGS,
        JSON.stringify(defaultGeneralSettings),
      ],
      [
        uuidv4(),
        BUSINESS_SETTINGS_NAME,
        JSON.stringify(defaultBusinessSettings),
      ],
    ];

    await queryRunner.query(
      `INSERT INTO system_settings (id, name, value) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [parameters],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
