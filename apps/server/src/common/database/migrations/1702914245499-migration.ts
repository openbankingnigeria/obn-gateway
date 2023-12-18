import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702914245499 implements MigrationInterface {
  name = 'Migration1702914245499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`environment\` varchar(255) NOT NULL DEFAULT 'development'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`environment\`
        `);
  }
}
