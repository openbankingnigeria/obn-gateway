import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1705508088419 implements MigrationInterface {
  name = 'Migration1705508088419';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_aec22778fbab259314e0a50457\` ON \`companies\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`is_active\` \`is_active\` tinyint NOT NULL DEFAULT 1
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`is_active\` \`is_active\` tinyint NOT NULL DEFAULT '0'
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_aec22778fbab259314e0a50457\` ON \`companies\` (\`primary_user_id\`)
        `);
  }
}
