import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701613419326 implements MigrationInterface {
  name = 'Migration1701613419326';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`rc_number\` varchar(255) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD UNIQUE INDEX \`IDX_5a6e554b4fa4033dd18a0f7a82\` (\`rc_number\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`is_verified\` tinyint NOT NULL DEFAULT 0
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`kyb_data\` longblob NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`kyb_data\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`is_verified\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP INDEX \`IDX_5a6e554b4fa4033dd18a0f7a82\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`rc_number\`
        `);
  }
}
