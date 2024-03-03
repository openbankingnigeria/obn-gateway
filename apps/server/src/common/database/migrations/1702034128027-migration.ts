import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702034128027 implements MigrationInterface {
  name = 'Migration1702034128027';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`is_active\` tinyint NOT NULL DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`is_active\`
        `);
  }
}
