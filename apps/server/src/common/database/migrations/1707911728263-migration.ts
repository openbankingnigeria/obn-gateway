import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1707911728263 implements MigrationInterface {
  name = 'Migration1707911728263';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`method\` enum (
                    'GET',
                    'HEAD',
                    'POST',
                    'PUT',
                    'DELETE',
                    'CONNECT',
                    'OPTIONS',
                    'TRACE',
                    'PATCH'
                ) NOT NULL DEFAULT 'GET'
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`request\` json NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`response\` json NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`response\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`request\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`method\`
        `);
  }
}
