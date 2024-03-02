import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1708281790835 implements MigrationInterface {
  name = 'Migration1708281790835';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\`
            ADD \`environment\` varchar(255) NOT NULL DEFAULT 'development'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\` DROP COLUMN \`environment\`
        `);
  }
}
