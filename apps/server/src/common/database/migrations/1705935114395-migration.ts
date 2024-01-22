import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705935114395 implements MigrationInterface {
    name = 'Migration1705935114395'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`kyb_status\` varchar(255) NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`kyb_status\`
        `);
    }

}
