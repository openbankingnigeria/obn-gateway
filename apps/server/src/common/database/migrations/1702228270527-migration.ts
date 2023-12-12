import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RoleStatuses } from '../entities';

export class Migration1702228270527 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO definitions (id, entity, type, value) VALUES ? ON DUPLICATE KEY UPDATE value = value`,
      [
        Object.values(RoleStatuses).map((status) => [
          uuidv4(),
          'role',
          'status',
          status,
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
