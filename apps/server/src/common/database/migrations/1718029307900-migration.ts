import { MigrationInterface, QueryRunner } from 'typeorm';
import { EMAIL_TEMPLATES } from '../constants';
import { v4 } from 'uuid';
import * as fs from 'fs';
import Handlebars from 'handlebars';

export class Migration1718029307900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const file = fs.readFileSync(
      __dirname + '/../../../shared/email/template.html',
    );

    const template = Handlebars.compile(file.toString());

    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        v4(),
        EMAIL_TEMPLATES.COMPANY_KYB_SUBMITTED,
        'New Access Request',
        template({
          title: 'New Access Request',
          body: [
            { text: 'Hello there,' },
            {
              text: 'An API Consumer has requested access to your APIs. Please review the details of the access request.',
            },
            {
              lists: [
                { field: 'AC Name', value: '{{apiConsumerName}}' },
                { field: 'AC Email', value: '{{apiConsumerEmail}}' },
              ],
            },
            {
              text: 'Please review the submitted documents to complete the KYB process and approve the request.',
            },
          ],
        }),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
