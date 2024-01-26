import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706269258256 implements MigrationInterface {
  name = 'Migration1706269258256';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`system_settings\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`value\` longblob NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`status\` \`status\` enum ('active', 'inactive') NOT NULL DEFAULT 'active'
        `);
    await queryRunner.query(`
            DROP TABLE IF EXISTS \`settings\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`status\` \`status\` enum ('active', 'pending', 'inactive') NOT NULL DEFAULT 'pending'
        `);
    await queryRunner.query(`
            DROP TABLE \`system_settings\`
        `);
  }
}
