import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701854914971 implements MigrationInterface {
  name = 'Migration1701854914971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_25d24010f53bb80b78e412c965\` ON \`role_permissions\` (\`role_id\`, \`permission_id\`)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_25d24010f53bb80b78e412c965\` ON \`role_permissions\`
        `);
  }
}
