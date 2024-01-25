import { BUSINESS_SETTINGS_NAME } from '../../../settings/settings.constants';
import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ensures that there can only be one system settings entry in the database
 */

export class Migration1706049934911 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TRIGGER enforce_system_settings_uniqueness
      BEFORE INSERT ON settings
      FOR EACH ROW
      BEGIN
        DECLARE existing_count INT;
        SELECT COUNT(*) INTO existing_count
        FROM settings
        WHERE name = NEW.name;

        IF existing_count > 0 AND New.name = '${BUSINESS_SETTINGS_NAME}' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Partial uniqueness violation: Another record with name system_settings already exists';
        END IF;
      END;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS enforce_system_settings_uniqueness;',
    );
  }
}
