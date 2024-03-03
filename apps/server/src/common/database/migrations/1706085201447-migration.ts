import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706085201447 implements MigrationInterface {
  name = 'Migration1706085201447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`status\` \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`status\` \`status\` enum ('active', 'pending', 'inactive') NOT NULL DEFAULT 'pending'
        `);
  }
}
