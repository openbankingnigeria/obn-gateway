import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699723205705 implements MigrationInterface {
  name = 'Migration1699723205705';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`audit_logs\` (
                \`id\` varchar(36) NOT NULL,
                \`event\` varchar(255) NOT NULL,
                \`details\` json NULL,
                \`company_id\` varchar(36) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`audit_logs\`
            ADD CONSTRAINT \`FK_50d854b973295d7c51bcf346efe\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`audit_logs\`
            ADD CONSTRAINT \`FK_bd2726fd31b35443f2245b93ba0\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_bd2726fd31b35443f2245b93ba0\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`audit_logs\` DROP FOREIGN KEY \`FK_50d854b973295d7c51bcf346efe\`
        `);
    await queryRunner.query(`
            DROP TABLE \`audit_logs\`
        `);
  }
}
