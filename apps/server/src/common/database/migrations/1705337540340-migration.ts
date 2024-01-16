import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1705337540340 implements MigrationInterface {
    name = 'Migration1705337540340'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`primary_user_id\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD UNIQUE INDEX \`IDX_aec22778fbab259314e0a50457\` (\`primary_user_id\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_aec22778fbab259314e0a50457\` ON \`companies\` (\`primary_user_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD CONSTRAINT \`FK_aec22778fbab259314e0a50457d\` FOREIGN KEY (\`primary_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`companies\` DROP FOREIGN KEY \`FK_aec22778fbab259314e0a50457d\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_aec22778fbab259314e0a50457\` ON \`companies\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\` DROP INDEX \`IDX_aec22778fbab259314e0a50457\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`primary_user_id\`
        `);
    }

}
