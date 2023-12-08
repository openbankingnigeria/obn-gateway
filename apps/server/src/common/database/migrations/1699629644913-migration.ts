import { hashSync } from 'bcrypt';
import { ROLES, CompanyTypes } from '../constants';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class Migration1699629644913 implements MigrationInterface {
  companyId = uuidv4();
  userId = uuidv4();
  profileId = uuidv4();

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum ('${CompanyTypes.BANK}', '${CompanyTypes.API_PROVIDER}') NOT NULL
    `);
    await queryRunner.query(
      `INSERT INTO companies (id, name, type) VALUES (?, ?, ?)`,
      [this.companyId, process.env.COMPANY_NAME, CompanyTypes.API_PROVIDER],
    );
    const roles = await queryRunner.query(
      `SELECT child.* FROM roles child INNER JOIN roles parent ON child.parent = parent.id WHERE parent.slug = ? AND child.slug = ? AND child.deleted_at IS NULL;`,
      [ROLES.API_PROVIDER, ROLES.ADMIN],
    );
    await queryRunner.query(
      `INSERT INTO users (id, email, role, password, company) VALUES (?, ?, ?, ?, ?)`,
      [
        this.userId,
        process.env.COMPANY_EMAIL,
        roles[0].id,
        hashSync(process.env.DEFAULT_PASSWORD!, 12),
        this.companyId,
      ],
    );
    await queryRunner.query(
      `INSERT INTO profiles (id, first_name, last_name, user) VALUES (?, ?, ?, ?)`,
      [this.profileId, '', '', this.userId],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE companies SET deleted_at = NOW() WHERE id = ?`,
      [this.companyId],
    );
    await queryRunner.query(
      `UPDATE users SET deleted_at = NOW() WHERE id = ?`,
      [this.userId],
    );
    await queryRunner.query(
      `UPDATE profiles SET deleted_at = NOW() WHERE id = ?`,
      [this.profileId],
    );
  }
}
