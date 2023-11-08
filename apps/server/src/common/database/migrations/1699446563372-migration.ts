import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699446563372 implements MigrationInterface {
  name = 'Migration1699446563372';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD \`slug\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_69ba2cc2e2b5dea3b938b5cd92\` ON \`roles\` (\`slug\`, \`parent\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_69ba2cc2e2b5dea3b938b5cd92\` ON \`roles\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP COLUMN \`slug\`
        `);
  }
}
