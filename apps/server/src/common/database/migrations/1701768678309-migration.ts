import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701768678309 implements MigrationInterface {
  name = 'Migration1701768678309';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`twofaSecret\` \`twofaSecret\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`twofaSecret\` \`twofaSecret\` varchar(255) NOT NULL
        `);
  }
}
