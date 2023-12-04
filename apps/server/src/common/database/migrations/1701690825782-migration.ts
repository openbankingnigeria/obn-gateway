import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701690825782 implements MigrationInterface {
  name = 'Migration1701690825782';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`twofaSecret\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`twofaEnabled\` tinyint NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`twofaEnabled\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`twofaSecret\`
        `);
  }
}
