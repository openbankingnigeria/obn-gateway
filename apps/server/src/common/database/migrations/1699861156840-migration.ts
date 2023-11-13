import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699861156840 implements MigrationInterface {
  name = 'Migration1699861156840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_495ce4b6a5f3319b1b4697f411d\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_0ab5175ebb91e7a07f850acf42e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_5d5086bd299f773d403574cf1c8\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_c1e75fd0e8a4dc0543ec66aa691\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_7e553107e0fbf8f1d3e16cf41c2\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_ace513fa30d485cfd25c11a9e4a\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_495ce4b6a5f3319b1b4697f411\` ON \`profiles\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_69ba2cc2e2b5dea3b938b5cd92\` ON \`roles\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`user_id\` \`user_id\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD UNIQUE INDEX \`IDX_9e432b7df0d182f8d292902d1a\` (\`user_id\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` CHANGE \`role_id\` \`role_id\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` CHANGE \`permission_id\` \`permission_id\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`role_id\` \`role_id\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`company_id\` \`company_id\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\` (\`user_id\`)
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_7d0c400375385d64c39911f974\` ON \`roles\` (\`slug\`, \`parent_id\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD CONSTRAINT \`FK_9e432b7df0d182f8d292902d1a2\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_178199805b901ccd220ab7740ec\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_17022daf3f885f7d35423e9971e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD CONSTRAINT \`FK_3e97eeaf865aeda0d20c0c5c509\` FOREIGN KEY (\`parent_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_a2cecd1a3531c0b041e29ba46e1\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_7ae6334059289559722437bcc1c\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_7ae6334059289559722437bcc1c\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_a2cecd1a3531c0b041e29ba46e1\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_3e97eeaf865aeda0d20c0c5c509\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_17022daf3f885f7d35423e9971e\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_178199805b901ccd220ab7740ec\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP FOREIGN KEY \`FK_9e432b7df0d182f8d292902d1a2\`
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_7d0c400375385d64c39911f974\` ON \`roles\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_9e432b7df0d182f8d292902d1a\` ON \`profiles\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`company_id\` \`company_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`role_id\` \`role_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` CHANGE \`permission_id\` \`permission_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\` CHANGE \`role_id\` \`role_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP INDEX \`IDX_9e432b7df0d182f8d292902d1a\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`user_id\` \`user_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_69ba2cc2e2b5dea3b938b5cd92\` ON \`roles\` (\`slug\`, \`parent_id\`)
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_495ce4b6a5f3319b1b4697f411\` ON \`profiles\` (\`user_id\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_ace513fa30d485cfd25c11a9e4a\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_7e553107e0fbf8f1d3e16cf41c2\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD CONSTRAINT \`FK_c1e75fd0e8a4dc0543ec66aa691\` FOREIGN KEY (\`parent_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_5d5086bd299f773d403574cf1c8\` FOREIGN KEY (\`role_id\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`role_permissions\`
            ADD CONSTRAINT \`FK_0ab5175ebb91e7a07f850acf42e\` FOREIGN KEY (\`permission_id\`) REFERENCES \`permissions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD CONSTRAINT \`FK_495ce4b6a5f3319b1b4697f411d\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
