import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1700016347598 implements MigrationInterface {
  name = 'Migration1700016347598';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`api_collections\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`slug\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_a744e65f55d9af3146a3554f48\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` enum ('SOFTWARE_ENGINEER', 'CEO', 'API_PROVIDER') NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum ('BANK') NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` enum ('SOFTWARE_ENGINEER', 'CEO') NOT NULL
        `);
    await queryRunner.query(`
            DROP INDEX \`IDX_a744e65f55d9af3146a3554f48\` ON \`api_collections\`
        `);
    await queryRunner.query(`
            DROP TABLE \`api_collections\`
        `);
  }
}
