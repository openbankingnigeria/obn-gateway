import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702020860810 implements MigrationInterface {
  name = 'Migration1702020860810';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`email_templates\` (
                \`id\` varchar(36) NOT NULL,
                \`slug\` varchar(255) NOT NULL,
                \`title\` varchar(255) NOT NULL,
                \`body\` longblob NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_47fbf61afd456e17d308bb2044\` (\`slug\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_47fbf61afd456e17d308bb2044\` ON \`email_templates\`
        `);
    await queryRunner.query(`
            DROP TABLE \`email_templates\`
        `);
  }
}
