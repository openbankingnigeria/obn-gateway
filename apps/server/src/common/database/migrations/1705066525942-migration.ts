import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705066525942 implements MigrationInterface {
    name = 'Migration1705066525942'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`account_number\` \`account_number\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`bvn\` \`bvn\` varchar(255) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`bvn\` \`bvn\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`account_number\` \`account_number\` varchar(255) NOT NULL
        `);
    }

}
