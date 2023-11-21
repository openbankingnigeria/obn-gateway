import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1699484587792 implements MigrationInterface {
  name = 'Migration1699484587792';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_e850707b5c70fa49ea50ef2f59f\`
        `);
    await queryRunner.query(`
            DROP INDEX \`REL_e850707b5c70fa49ea50ef2f59\` ON \`users\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\` DROP COLUMN \`profile\`
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD \`profile\` varchar(36) NOT NULL
        `);
    await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_e850707b5c70fa49ea50ef2f59\` ON \`users\` (\`profile\`)
        `);
    await queryRunner.query(`
            ALTER TABLE \`users\`
            ADD CONSTRAINT \`FK_e850707b5c70fa49ea50ef2f59f\` FOREIGN KEY (\`profile\`) REFERENCES \`profiles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
  }
}
