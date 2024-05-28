import { MigrationInterface, QueryRunner } from 'typeorm';
import { CompanyTypes } from '../constants';

export class Migration1705500650024 implements MigrationInterface {
  name = 'Migration1705500650024';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.query(
      `
            SELECT users.* FROM users 
            INNER JOIN companies ON users.company_id = companies.id 
            WHERE users.email = ? AND users.deleted_at IS NULL AND companies.deleted_at IS NULL AND companies.type = ?
            ORDER BY users.created_at ASC LIMIT 1
        `,
      [process.env.DEFAULT_EMAIL, CompanyTypes.API_PROVIDER],
    );
    await queryRunner.query(
      'UPDATE companies SET is_active = true, primary_user_id = ? WHERE id = ?',
      [users[0].id, users[0].company_id],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const users = await queryRunner.query(
      `
            SELECT users.* FROM users 
            INNER JOIN companies ON users.company_id = companies.id 
            WHERE users.email = ? AND users.deleted_at IS NULL AND companies.deleted_at IS NULL 
            ORDER BY users.created_at ASC LIMIT 1
        `,
      [process.env.DEFAULT_EMAIL],
    );
    await queryRunner.query(
      'UPDATE companies SET is_active = false, primary_user_id = null WHERE id = ?',
      [users[0].company_id],
    );
  }
}
