import { MigrationInterface, QueryRunner } from 'typeorm';
import { CompanyTypes } from '../constants';

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

    const users = await queryRunner.query(
      `
                  SELECT users.* FROM users 
                  INNER JOIN companies ON users.company_id = companies.id 
                  WHERE users.email = ? AND users.deleted_at IS NULL AND companies.deleted_at IS NULL AND companies.type = ?
                  ORDER BY users.created_at ASC LIMIT 1
              `,
      [process.env.COMPANY_EMAIL, CompanyTypes.API_PROVIDER],
    );

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

    await queryRunner.query('UPDATE companies SET type = ? WHERE id = ?', [
      CompanyTypes.API_PROVIDER,
      users[0].company_id,
    ]);
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
