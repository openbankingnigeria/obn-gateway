import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1711097719464 implements MigrationInterface {
  name = 'Migration1711097719464';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`introspect_authorization\` tinyint NOT NULL DEFAULT 0
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`introspect_authorization\`
        `);
  }
}
