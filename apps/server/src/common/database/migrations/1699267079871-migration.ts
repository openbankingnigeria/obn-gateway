import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699267079871 implements MigrationInterface {
  name = 'Migration1699267079871';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`permissions\`
            ADD UNIQUE INDEX \`IDX_d090ad82a0e97ce764c06c7b31\` (\`slug\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`permissions\` DROP INDEX \`IDX_d090ad82a0e97ce764c06c7b31\`
        `);
  }
}
