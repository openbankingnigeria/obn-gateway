import {
  EmailSettingsInterface,
  GeneralSettingsInterface,
  SETTINGS_TYPES,
} from '../../../settings/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CompanyTypes } from '../constants';
import { Company, CompanyStatuses } from '../entities';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';

const defaultEmailSettings: EmailSettingsInterface = {
  emailBaseUrl: { value: '' },
  emailFrom: { value: (process.env.EMAIL_FROM as string) || '' },
  emailHost: { value: (process.env.EMAIL_HOST as string) || '' },
  emailPassword: { value: (process.env.EMAIL_PASSWORD as string) || '' },
  emailPort: { value: (process.env.EMAIL_PORT as string) || '' },
  emailSecure: { value: (process.env.EMAIL_SECURE as string) === 'true' ?? '' },
  emailUser: { value: (process.env.EMAIL_USER as string) || '' },
};

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

export class Migration1706053809488 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [apiProvider]: Company[] = await queryRunner.query(
      `SELECT * FROM companies WHERE type = '${CompanyTypes.API_PROVIDER}' ORDER BY created_at ASC LIMIT 1`,
    );

    const parameters = [
      [
        uuidv4(),
        SETTINGS_TYPES.EMAIL_SETTINGS,
        apiProvider.id,
        JSON.stringify(defaultEmailSettings),
      ],
      [
        uuidv4(),
        SETTINGS_TYPES.GENERAL_SETTINGS,
        apiProvider.id,
        JSON.stringify(defaultGeneralSettings),
      ],
    ];

    await queryRunner.query(
      `INSERT INTO settings (id, name, company_id, value) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [parameters],
    );

    await queryRunner.query(
      `UPDATE settings SET name = ? WHERE name = '${BUSINESS_SETTINGS_NAME}'`,
      [BUSINESS_SETTINGS_NAME],
    );

    await queryRunner.query(
      `UPDATE companies SET status = ?, kyb_status = ? WHERE id = '${apiProvider.id}'`,
      [CompanyStatuses.ACTIVE, 'approved'],
    );
  }

  public async down(): Promise<void> {}
}
