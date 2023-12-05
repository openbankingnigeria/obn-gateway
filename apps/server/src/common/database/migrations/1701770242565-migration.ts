import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701770242565 implements MigrationInterface {
  name = 'Migration1701770242565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`twofaEnabled\` \`twofaEnabled\` tinyint NOT NULL DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`twofaEnabled\` \`twofaEnabled\` tinyint NOT NULL
        `);
  }
}
