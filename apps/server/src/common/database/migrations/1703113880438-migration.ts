import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1703113880438 implements MigrationInterface {
  name = 'Migration1703113880438';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`subtype\` varchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum (
                    'Bank',
                    'BNPL',
                    'Lending',
                    'Fintech',
                    'Insurance',
                    'Others',
                    'API_PROVIDER'
                ) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`subtype\`
        `);
  }
}
