import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1706702923465 implements MigrationInterface {
  name = 'Migration1706702923465';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`url\` varchar(255) NOT NULL DEFAULT '/'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`url\`
        `);
  }
}
