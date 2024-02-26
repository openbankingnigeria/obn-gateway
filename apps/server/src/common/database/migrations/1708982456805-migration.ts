import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1708982456805 implements MigrationInterface {
  name = 'Migration1708982456805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`kyb_data\` \`kyb_data_id\` longblob NULL
        `);
    await queryRunner.query(`
            CREATE TABLE \`company_kyb_data\` (
                \`id\` varchar(36) NOT NULL,
                \`company_id\` varchar(255) NOT NULL,
                \`data\` longblob NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`REL_d9a4df208158babc6ce896f7af\` (\`company_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`kyb_data_id\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`kyb_data_id\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD UNIQUE INDEX \`IDX_b17dab816af23ffe6660b41cbb\` (\`kyb_data_id\`)
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_b17dab816af23ffe6660b41cbb\` ON \`companies\` (\`kyb_data_id\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`company_kyb_data\`
            ADD CONSTRAINT \`FK_d9a4df208158babc6ce896f7afa\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD CONSTRAINT \`FK_b17dab816af23ffe6660b41cbb1\` FOREIGN KEY (\`kyb_data_id\`) REFERENCES \`company_kyb_data\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_b17dab816af23ffe6660b41cbb1\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`company_kyb_data\` DROP FOREIGN KEY \`FK_d9a4df208158babc6ce896f7afa\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_b17dab816af23ffe6660b41cbb\` ON \`companies\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP INDEX \`IDX_b17dab816af23ffe6660b41cbb\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`kyb_data_id\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`kyb_data_id\` longblob NULL
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_d9a4df208158babc6ce896f7af\` ON \`company_kyb_data\`
        `);
    await queryRunner.query(`
            DROP TABLE \`company_kyb_data\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`kyb_data_id\` \`kyb_data\` longblob NULL
        `);
  }
}
