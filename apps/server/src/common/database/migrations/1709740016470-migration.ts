import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1709740016470 implements MigrationInterface {
  name = 'Migration1709740016470';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`refresh_token\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`refresh_token\`
        `);
  }
}
