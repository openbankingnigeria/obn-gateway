import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699268232421 implements MigrationInterface {
  name = 'Migration1699268232421';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`profiles\` (
                \`id\` varchar(36) NOT NULL,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\` varchar(255) NOT NULL,
                \`company_role\` enum ('SOFTWARE_ENGINEER', 'CEO') NOT NULL,
                \`phone\` varchar(255) NULL,
                \`country\` varchar(255) NULL,
                \`user\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`REL_495ce4b6a5f3319b1b4697f411\` (\`user\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`roles\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`status\` varchar(255) NOT NULL,
                \`parent\` varchar(36) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(255) NOT NULL,
                \`password\` varchar(255) NOT NULL,
                \`role\` varchar(36) NOT NULL,
                \`company\` varchar(36) NOT NULL,
                \`profile\` varchar(36) NOT NULL,
                \`reset_password_token\` varchar(255) NULL,
                \`reset_password_expires\` datetime NULL,
                \`last_password_change\` datetime NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`REL_e850707b5c70fa49ea50ef2f59\` (\`profile\`),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`companies\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`slug\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_d090ad82a0e97ce764c06c7b31\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            CREATE TABLE \`role_permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`role\` varchar(36) NOT NULL,
                \`permission\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD CONSTRAINT \`FK_495ce4b6a5f3319b1b4697f411d\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD CONSTRAINT \`FK_c1e75fd0e8a4dc0543ec66aa691\` FOREIGN KEY (\`parent\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_ace513fa30d485cfd25c11a9e4a\` FOREIGN KEY (\`role\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_7e553107e0fbf8f1d3e16cf41c2\` FOREIGN KEY (\`company\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_e850707b5c70fa49ea50ef2f59f\` FOREIGN KEY (\`profile\`) REFERENCES \`profiles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_5d5086bd299f773d403574cf1c8\` FOREIGN KEY (\`role\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_0ab5175ebb91e7a07f850acf42e\` FOREIGN KEY (\`permission\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_0ab5175ebb91e7a07f850acf42e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_5d5086bd299f773d403574cf1c8\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_e850707b5c70fa49ea50ef2f59f\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_7e553107e0fbf8f1d3e16cf41c2\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_ace513fa30d485cfd25c11a9e4a\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_c1e75fd0e8a4dc0543ec66aa691\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_495ce4b6a5f3319b1b4697f411d\`
        `);
    await queryRunner.query(`
            DROP TABLE \`role_permissions\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_d090ad82a0e97ce764c06c7b31\` ON \`permissions\`
        `);
    await queryRunner.query(`
            DROP TABLE \`permissions\`
        `);
    await queryRunner.query(`
            DROP TABLE \`companies\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_e850707b5c70fa49ea50ef2f59\` ON \`users\`
        `);
    await queryRunner.query(`
            DROP TABLE \`users\`
        `);
    await queryRunner.query(`
            DROP TABLE \`roles\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_495ce4b6a5f3319b1b4697f411\` ON \`profiles\`
        `);
    await queryRunner.query(`
            DROP TABLE \`profiles\`
        `);
  }
}
