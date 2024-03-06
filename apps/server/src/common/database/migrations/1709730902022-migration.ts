import {
  BUSINESS_SETTINGS_NAME,
  defaultBusinessSettings,
} from '../../../settings/settings.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1709730902022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const parameters = [[JSON.stringify(defaultBusinessSettings)]];

    await queryRunner.query(
      `UPDATE system_settings SET value = ? WHERE name = '${BUSINESS_SETTINGS_NAME}';`,
      [parameters],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
