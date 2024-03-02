import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702450267428 implements MigrationInterface {
  name = 'Migration1702450267428';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`twofa_backup_codes\` (
                \`id\` varchar(36) NOT NULL,
                \`value\` varchar(255) NOT NULL,
                \`user_id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`twofa_backup_codes\`
            ADD CONSTRAINT \`FK_49a5ceda565bf1c71ae8554206c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`twofa_backup_codes\` DROP FOREIGN KEY \`FK_49a5ceda565bf1c71ae8554206c\`
        `);
    await queryRunner.query(`
            DROP TABLE \`twofa_backup_codes\`
        `);
  }
}
