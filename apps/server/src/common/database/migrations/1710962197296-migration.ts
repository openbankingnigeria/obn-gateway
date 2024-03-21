import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1710962197296 implements MigrationInterface {
  name = 'Migration1710962197296';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE companies SET tier = '0' WHERE tier IS NULL`,
    );
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`tier\` \`tier\` varchar(255) NOT NULL DEFAULT '0'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`companies\` CHANGE \`tier\` \`tier\` varchar(255) NULL
        `);
  }
}
