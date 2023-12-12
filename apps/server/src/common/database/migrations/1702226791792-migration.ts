import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1702226791792 implements MigrationInterface {
  name = 'Migration1702226791792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE \`definitions\` (
                \`id\` varchar(36) NOT NULL,
                \`entity\` varchar(255) NOT NULL,
                \`type\` varchar(255) NOT NULL,
                \`value\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`deleted_at\` datetime(6) NULL,
                UNIQUE INDEX \`IDX_69f622b240789f97ac965b7b53\` (\`entity\`, \`type\`, \`value\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`IDX_69f622b240789f97ac965b7b53\` ON \`definitions\`
        `);
    await queryRunner.query(`
            DROP TABLE \`definitions\`
        `);
  }
}
