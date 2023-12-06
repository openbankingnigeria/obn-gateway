import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../entities';

export class Migration1701883113873 implements MigrationInterface {
  private readonly defaultSettings = {
    uneditableFields: ['taxIdentificationNumber', 'registryLicense'],
    kybRequirements: [
      {
        name: 'taxIdentificationNumber',
        label: 'Tax Identification Number',
        type: 'string',
        editable: false,
      },
      {
        name: 'registryLicense',
        label: 'Registry License',
        type: 'file',
        editable: false,
        maxCount: 1,
      },
      {
        name: 'companyStatusReport',
        label: 'Company Status Report',
        type: 'file',
        editable: true,
        maxCount: 1,
      },
      {
        name: 'certificateOfIncorporation',
        label: 'Certificate Of Incorporation',
        type: 'file',
        editable: true,
        maxCount: 1,
      },
    ],
  };
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [apiProvider]: Company[] = await queryRunner.query(
      `SELECT * FROM companies ORDER BY created_at ASC`,
    );

    const parameters = [
      [
        uuidv4(),
        'kyb_settings',
        apiProvider.id,
        JSON.stringify(this.defaultSettings),
      ],
    ];

    await queryRunner.query(
      `INSERT INTO settings (id, name, company_id, value) VALUES ? ON DUPLICATE KEY UPDATE name = VALUES(name)`,
      [parameters],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE settings SET deleted_at = NOW()`);
  }
}