import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701028484370 implements MigrationInterface {
  name = 'Migration1701028484370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`api_collection_service_routes\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`serviceId\` varchar(255) NOT NULL,
                \`routeId\` varchar(255) NOT NULL,
                \`collection_id\` varchar(36) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD CONSTRAINT \`FK_88eb5acf3b2634b38fec7d2f30e\` FOREIGN KEY (\`collection_id\`) REFERENCES \`api_collections\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP FOREIGN KEY \`FK_88eb5acf3b2634b38fec7d2f30e\`
        `);
    await queryRunner.query(`
            DROP TABLE \`api_collection_service_routes\`
        `);
  }
}
