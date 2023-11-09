import { ROLES } from '../../../roles/types';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class Migration1699455791087 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const provider = [
      uuidv4(),
      ROLES.API_PROVIDER.replace(/-/g, ' '),
      ROLES.API_PROVIDER,
      null,
      'active',
      '',
    ];
    const consumer = [
      uuidv4(),
      ROLES.API_CONSUMER.replace(/-/g, ' '),
      ROLES.API_CONSUMER,
      null,
      'active',
      '',
    ];

    const parameters = [
      provider,
      consumer,
      [
        uuidv4(),
        ROLES.ADMIN.replace(/-/g, ' '),
        ROLES.ADMIN,
        provider[0],
        'active',
        '',
      ],
      [
        uuidv4(),
        ROLES.ADMIN.replace(/-/g, ' '),
        ROLES.ADMIN,
        consumer[0],
        'active',
        '',
      ],
    ];

    await queryRunner.query(
      `INSERT INTO roles (id, name, slug, parent, status, description) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description)`,
      [parameters],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE roles SET deleted_at = NOW()`);
  }
}
