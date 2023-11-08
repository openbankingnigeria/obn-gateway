import { PERMISSIONS } from '../../../permissions/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class Migration1699268308274 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO permissions (id, name, slug, description) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [
        Object.values(PERMISSIONS).map((permission) => [
          uuidv4(),
          permission.replace(/-/g, ' '),
          permission,
          '',
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE permissions SET deleted_at = NOW()`);
  }
}
