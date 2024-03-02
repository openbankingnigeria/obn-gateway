import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701035808937 implements MigrationInterface {
  name = 'Migration1701035808937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`enabled\` tinyint NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`enabled\`
        `);
  }
}
