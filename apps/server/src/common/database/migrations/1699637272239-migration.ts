import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1699637272239 implements MigrationInterface {
    name = 'Migration1699637272239'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`last_login\` datetime NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`last_login\`
        `);
    }

}
