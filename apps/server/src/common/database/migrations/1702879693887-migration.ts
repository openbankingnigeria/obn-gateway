import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702879693887 implements MigrationInterface {
  name = 'Migration1702879693887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE users RENAME COLUMN twofaEnabled TO twofa_enabled;
        `);
    await queryRunner.query(`
            ALTER TABLE users RENAME COLUMN twofaSecret TO twofa_secret;
        `);
    await queryRunner.query(`
            ALTER TABLE api_collection_service_routes RENAME COLUMN routeId TO route_id;
        `);
    await queryRunner.query(`
            ALTER TABLE api_collection_service_routes RENAME COLUMN serviceId TO service_id;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE api_collection_service_routes RENAME COLUMN service_id TO serviceId;
        `);
    await queryRunner.query(`
            ALTER TABLE api_collection_service_routes RENAME COLUMN route_id TO routeId;
        `);
    await queryRunner.query(`
            ALTER TABLE users RENAME COLUMN twofa_secret TO twofaSecret;
        `);
    await queryRunner.query(`
            ALTER TABLE users RENAME COLUMN twofa_enabled TO twofaEnabled;
        `);
  }
}
