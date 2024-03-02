import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1705833346962 implements MigrationInterface {
  name = 'Migration1705833346962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`status\` enum ('active', 'pending', 'inactive') NOT NULL DEFAULT 'pending'
        `);
    await queryRunner.query(
      `UPDATE companies SET status = 'active' WHERE is_active = TRUE`,
    );
    await queryRunner.query(`
        ALTER TABLE \`companies\` DROP COLUMN \`is_active\`
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`status\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`is_active\` tinyint NOT NULL DEFAULT '1'
        `);
  }
}
