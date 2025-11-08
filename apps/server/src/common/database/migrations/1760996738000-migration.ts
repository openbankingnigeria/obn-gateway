import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760996738000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE \`imported_api_specs\` (
        \`id\` varchar(36) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`spec_format\` enum('openapi_v2', 'openapi_v3', 'postman_v2', 'postman_v21') NOT NULL,
        \`spec_version\` varchar(50) DEFAULT NULL,
        \`original_spec\` longtext NOT NULL,
        \`parsed_metadata\` json DEFAULT NULL,
        \`import_status\` enum('pending', 'processing', 'completed', 'failed', 'partial') NOT NULL DEFAULT 'pending',
        \`imported_count\` int NOT NULL DEFAULT '0',
        \`failed_count\` int NOT NULL DEFAULT '0',
        \`error_log\` json DEFAULT NULL,
        \`collection_id\` varchar(36) NOT NULL,
        \`environment\` varchar(50) NOT NULL,
        \`imported_by_id\` varchar(36) NOT NULL,
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
        \`deleted_at\` datetime(6) DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`idx_collection_id\` (\`collection_id\`),
        KEY \`idx_environment\` (\`environment\`),
        KEY \`idx_import_status\` (\`import_status\`),
        KEY \`idx_imported_by_id\` (\`imported_by_id\`),
        CONSTRAINT \`FK_imported_specs_collection\` FOREIGN KEY (\`collection_id\`) REFERENCES \`api_collections\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_imported_specs_user\` FOREIGN KEY (\`imported_by_id\`) REFERENCES \`users\` (\`id\`) ON DELETE NO ACTION
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);

    await queryRunner.query(`
      ALTER TABLE \`api_collection_service_routes\`
        ADD COLUMN \`imported_spec_id\` varchar(36) DEFAULT NULL,
        ADD COLUMN \`original_spec_path\` varchar(500) DEFAULT NULL,
        ADD COLUMN \`spec_metadata\` json DEFAULT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`api_collection_service_routes\`
        ADD KEY \`idx_imported_spec_id\` (\`imported_spec_id\`),
        ADD CONSTRAINT \`FK_imported_spec\` FOREIGN KEY (\`imported_spec_id\`) REFERENCES \`imported_api_specs\` (\`id\`) ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`api_collection_service_routes\`
        DROP FOREIGN KEY \`FK_imported_spec\`
    `);

    await queryRunner.query(`
      ALTER TABLE \`api_collection_service_routes\`
        DROP KEY \`idx_imported_spec_id\`,
        DROP COLUMN \`imported_spec_id\`,
        DROP COLUMN \`original_spec_path\`,
        DROP COLUMN \`spec_metadata\`
    `);

    await queryRunner.query(`DROP TABLE \`imported_api_specs\``);
  }
}
