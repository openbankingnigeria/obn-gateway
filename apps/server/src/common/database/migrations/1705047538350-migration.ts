import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1705047538350 implements MigrationInterface {
  name = 'Migration1705047538350';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`subtype\` \`subtype\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`subtype\` \`subtype\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` varchar(255) NOT NULL
        `);
  }
}
