import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Company } from '../entities';
import { CompanyTypes } from '../constants';
import { SYSTEM_SETTINGS_NAME } from '../../../settings/settings.constants';

export class Migration1701884323523 implements MigrationInterface {
  private readonly defaultSettings = {
    uneditableFields: ['taxIdentificationNumber', 'registryLicense'],
    kybRequirements: [
      {
        name: 'taxIdentificationNumber',
        label: 'Tax Identification Number',
        type: 'string',
        editable: false,
        length: 15,
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
    companySubtypes: {
      [CompanyTypes.INDIVIDUAL]: [],
      [CompanyTypes.LICENSED_ENTITY]: [
        'Commercial Bank',
        'Merchant Bank',
        'Non-interest Bank',
        'Microfinance Bank',
        'Finance House',
        'Payments Solutions Services Provider',
        'Super Agent',
        'Mobile Money Operator',
        'Switch and Processor',
        'Payments Solutions Services',
        'Payments Terminal Services Provider',
        'Insurance',
        'Capital Market Operator',
        'Others',
      ],
      [CompanyTypes.BUSINESS]: [
        'Telecommunications',
        'Manufacturer',
        'Healthcare',
        'Logistics',
        'Real Estate',
        'Entertainment',
        'Hospitality',
        'Technology',
        'Medical',
        'Public Sector',
        'Others',
      ],
    },
  };
  public async up(queryRunner: QueryRunner): Promise<void> {
    const [apiProvider]: Company[] = await queryRunner.query(
      `SELECT * FROM companies WHERE type = '${CompanyTypes.API_PROVIDER}' ORDER BY created_at ASC`,
    );

    const parameters = [
      [
        uuidv4(),
        SYSTEM_SETTINGS_NAME,
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
