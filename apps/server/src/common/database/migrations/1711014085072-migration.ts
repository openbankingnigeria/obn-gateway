import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1711014085072 implements MigrationInterface {
  name = 'Migration1711014085072';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`slug\` varchar(255) NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`slug\`
        `);
  }
}
