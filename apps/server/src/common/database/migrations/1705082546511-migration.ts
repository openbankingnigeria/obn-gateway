import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705082546511 implements MigrationInterface {
    name = 'Migration1705082546511'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`account_number\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`bvn\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum (
                    'individual',
                    'licensed-entity',
                    'business',
                    'api-provider'
                ) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`subtype\` \`subtype\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`subtype\` \`subtype\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`type\` \`type\` enum (
                    'individual',
                    'licensedEntity',
                    'business',
                    'api-provider'
                ) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profiles\` CHANGE \`company_role\` \`company_role\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`bvn\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`account_number\`
        `);
    }

}
