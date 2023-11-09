import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699541112479 implements MigrationInterface {
  name = 'Migration1699541112479';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`status\` varchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`status\`
        `);
  }
}
