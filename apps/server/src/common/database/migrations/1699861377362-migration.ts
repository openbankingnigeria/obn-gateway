import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699861377362 implements MigrationInterface {
  name = 'Migration1699861377362';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE users SET status = 'pending' WHERE status NOT IN ('active','pending','inactive')`,
    );
    await queryRunner.query(`
      ALTER TABLE users CHANGE status status enum('active','pending','inactive') NOT NULL DEFAULT 'pending';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users CHANGE status status VARCHAR(255);
    `);
  }
}
