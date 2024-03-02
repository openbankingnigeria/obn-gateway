import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701277944195 implements MigrationInterface {
  name = 'Migration1701277944195';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_7d0c400375385d64c39911f974\` ON \`roles\`
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_76fd170a4710cc49e64cf92171\` ON \`roles\` (\`slug\`, \`parent_id\`, \`company_id\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_76fd170a4710cc49e64cf92171\` ON \`roles\`
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_7d0c400375385d64c39911f974\` ON \`roles\` (\`slug\`, \`parent_id\`)
        `);
  }
}
