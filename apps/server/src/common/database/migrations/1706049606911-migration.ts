import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706049606911 implements MigrationInterface {
  name = 'Migration1706049606911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_ca7857276d2a30f4dcfa0e42cd\` ON \`settings\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_ca7857276d2a30f4dcfa0e42cd\` ON \`settings\` (\`name\`)
        `);
  }
}
