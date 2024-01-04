import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1704362393167 implements MigrationInterface {
  name = 'Migration1704362393167';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`account_number\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`bvn\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`tier\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum (
                    'individual',
                    'licensedEntity',
                    'business',
                    'api-provider'
                ) NOT NULL
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
            ALTER TABLE \`companies\` DROP COLUMN \`tier\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`bvn\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`account_number\`
        `);
  }
}
