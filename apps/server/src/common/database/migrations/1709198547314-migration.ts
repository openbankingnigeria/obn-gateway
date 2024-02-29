import {
  AdditionalOnboardingCustomFieldsInterface,
  SETTINGS_TYPES,
  UserAgreementSettingsInterface,
} from '../../../settings/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

const defaulUserAgreementSettings: UserAgreementSettingsInterface = {
  privacyPolicy: { value: '' },
  termsAndConditions: { value: '' },
};

const defaultAdditionalOnboardingCustomFieldSettings: AdditionalOnboardingCustomFieldsInterface =
  {
    'licensed-entity': {},
    business: {},
    individual: {},
  };

export class Migration1709198547314 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const parameters = [
      [
        uuidv4(),
        SETTINGS_TYPES.USER_AGREEMENTS,
        JSON.stringify(defaulUserAgreementSettings),
      ],
      [
        uuidv4(),
        SETTINGS_TYPES.ONBOARDING_CUSTOM_FIELDS,
        JSON.stringify(defaultAdditionalOnboardingCustomFieldSettings),
      ],
    ];

    await queryRunner.query(
      `INSERT INTO system_settings (id, name, value) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [parameters],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM system_settings WHERE name = '${SETTINGS_TYPES.ONBOARDING_CUSTOM_FIELDS}'`,
    );

    await queryRunner.query(
      `DELETE FROM system_settings WHERE name = '${SETTINGS_TYPES.USER_AGREEMENTS}'`,
    );
  }
}
