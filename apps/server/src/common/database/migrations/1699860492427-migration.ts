import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699860492427 implements MigrationInterface {
  name = 'Migration1699860492427';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role role_id varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE users CHANGE company company_id varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE role_permissions CHANGE role role_id varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE role_permissions CHANGE permission permission_id varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE roles CHANGE parent parent_id varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE profiles CHANGE user user_id varchar(36)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE users CHANGE role_id role varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE users CHANGE company_id company varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE role_permissions CHANGE role_id role varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE role_permissions CHANGE permission_id permission varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE roles CHANGE parent_id parent varchar(36)`,
    );

    await queryRunner.query(
      `ALTER TABLE profiles CHANGE user_id user varchar(36)`,
    );
  }
}
