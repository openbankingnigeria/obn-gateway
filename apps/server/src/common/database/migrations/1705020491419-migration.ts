import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1705020491419 implements MigrationInterface {
  name = 'Migration1705020491419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`account_number\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`bvn\` varchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`bvn\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`account_number\`
        `);
  }
}
