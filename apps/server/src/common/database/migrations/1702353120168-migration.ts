import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702353120168 implements MigrationInterface {
  name = 'Migration1702353120168';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`email_verification_otp\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`email_verification_expires\` datetime NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`type\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` ADD \`type\` enum (
                    'individual',
                    'licensedEntity',
                    'business',
                    'api-provider'
                ) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`tier\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`type\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`type\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`email_verification_expires\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`email_verification_otp\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`email_verified\`
        `);
  }
}
