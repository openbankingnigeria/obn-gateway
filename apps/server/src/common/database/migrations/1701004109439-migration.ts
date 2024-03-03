import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1701004109439 implements MigrationInterface {
  name = 'Migration1701004109439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD \`company_id\` varchar(36) NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`permissions\` CHANGE \`description\` \`description\` text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` CHANGE \`description\` \`description\` text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collections\` CHANGE \`description\` \`description\` text NOT NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\`
            ADD CONSTRAINT \`FK_4bc1204a05dde26383e3955b0a1\` FOREIGN KEY (\`company_id\`) REFERENCES \`companies\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_4bc1204a05dde26383e3955b0a1\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`api_collections\` CHANGE \`description\` \`description\` text NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` CHANGE \`description\` \`description\` text NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`permissions\` CHANGE \`description\` \`description\` text NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`roles\` DROP COLUMN \`company_id\`
        `);
  }
}
