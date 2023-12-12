import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701884280574 implements MigrationInterface {
  name = 'Migration1701884280574';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`settings\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`company_id\` varchar(36) NOT NULL,
                \`value\` longblob NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_ca7857276d2a30f4dcfa0e42cd\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP COLUMN \`company_role\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD \`company_role\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`settings\`
            ADD CONSTRAINT \`FK_3dc0f88c481ee12c88efbdafb0c\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_3dc0f88c481ee12c88efbdafb0c\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`type\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` DROP COLUMN \`company_role\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\`
            ADD \`company_role\` enum ('SOFTWARE_ENGINEER', 'CEO', 'API_PROVIDER') NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_ca7857276d2a30f4dcfa0e42cd\` ON \`settings\`
        `);
    await queryRunner.query(`
            DROP TABLE \`settings\`
        `);
  }
}
