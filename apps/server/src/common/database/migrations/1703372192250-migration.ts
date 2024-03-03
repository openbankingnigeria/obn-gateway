import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1703372192250 implements MigrationInterface {
  name = 'Migration1703372192250';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`consumer_acls\` (
                \`id\` varchar(36) NOT NULL,
                \`route_id\` varchar(36) NOT NULL,
                \`company_id\` varchar(36) NOT NULL,
                \`acl_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\`
            ADD \`acl_allowed_group_name\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`consumer_id\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\`
            ADD CONSTRAINT \`FK_a6a31ca96749f93bf5df0b4c412\` FOREIGN KEY (\`route_id\`) REFERENCES \`api_collection_service_routes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\`
            ADD CONSTRAINT \`FK_35589f237ac0be2d2c749c87b4b\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\` DROP FOREIGN KEY \`FK_35589f237ac0be2d2c749c87b4b\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`consumer_acls\` DROP FOREIGN KEY \`FK_a6a31ca96749f93bf5df0b4c412\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`consumer_id\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collection_service_routes\` DROP COLUMN \`acl_allowed_group_name\`
        `);
    await queryRunner.query(`
            DROP TABLE \`consumer_acls\`
        `);
  }
}
