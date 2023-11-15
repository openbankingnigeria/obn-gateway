import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1700044275028 implements MigrationInterface {
  name = 'Migration1700044275028';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE roles MODIFY description TEXT;
        `);
    await queryRunner.query(`
            ALTER TABLE permissions MODIFY description TEXT;
        `);
    await queryRunner.query(`
            ALTER TABLE api_collections MODIFY description TEXT;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE api_collections MODIFY VARCHAR(255);
    `);
    await queryRunner.query(`
            ALTER TABLE permissions MODIFY VARCHAR(255);
    `);
    await queryRunner.query(`
            ALTER TABLE roles MODIFY VARCHAR(255);
    `);
  }
}
