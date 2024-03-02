import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1709109621469 implements MigrationInterface {
  name = 'Migration1709109621469';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`tiers\` json NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`tiers\`
        `);
  }
}
