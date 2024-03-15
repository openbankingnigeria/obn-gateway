import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1710487707151 implements MigrationInterface {
  name = 'Migration1710487707151';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_b17dab816af23ffe6660b41cbb\` ON \`companies\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`companies\` DROP COLUMN \`consumer_id\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\`
            ADD \`consumer_id\` varchar(255) NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_b17dab816af23ffe6660b41cbb\` ON \`companies\` (\`kyb_data_id\`)
        `);
  }
}
