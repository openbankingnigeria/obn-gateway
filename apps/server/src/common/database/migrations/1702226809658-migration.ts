import { MigrationInterface, QueryRunner } from 'typeorm';

import { UserStatuses } from '../entities';
import { v4 as uuidv4 } from 'uuid';

export class Migration1702226809658 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO definitions (id, entity, type, value) VALUES ? ON DUPLICATE KEY UPDATE value = value`,
      [
        Object.values(UserStatuses).map((status) => [
          uuidv4(),
          'user',
          'status',
          status,
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
