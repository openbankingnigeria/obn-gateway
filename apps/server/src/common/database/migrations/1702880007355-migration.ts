import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702880007355 implements MigrationInterface {
  name = 'Migration1702880007355';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` CHANGE \`service_id\` \`service_id\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` CHANGE \`route_id\` \`route_id\` varchar(255) NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` CHANGE \`route_id\` \`route_id\` varchar(255) NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` CHANGE \`service_id\` \`service_id\` varchar(255) NOT NULL
        `);
  }
}
