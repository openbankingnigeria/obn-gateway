import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699861318593 implements MigrationInterface {
  name = 'Migration1699861318593';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_9e432b7df0d182f8d292902d1a\` ON \`profiles\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_9e432b7df0d182f8d292902d1a\` ON \`profiles\` (\`user_id\`)
        `);
  }
}
