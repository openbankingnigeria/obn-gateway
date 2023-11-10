import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699612452949 implements MigrationInterface {
  name = 'Migration1699612452949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`status\` \`status\` varchar(255) NOT NULL DEFAULT 'pending'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`status\` \`status\` varchar(255) NOT NULL
        `);
  }
}
