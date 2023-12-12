import * as fs from 'fs';
import { MigrationInterface, QueryRunner } from 'typeorm';
import Handlebars from 'handlebars';
import { EMAIL_TEMPLATES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export class Migration1702029963745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const file = fs.readFileSync(
      __dirname + '/../../../shared/email/template.html',
    );

    const template = Handlebars.compile(file.toString());

    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.COMPANY_KYB_APPROVED,
        'Request Has Been Approved',
        template({
          title: 'Request Has Been Approved',
          body: [
            { text: 'Hi {{name}},' },
            {
              text: 'Your request for API access on our platform has been approved by the API Provider.',
            },
            { text: 'Here are the details of your approval:' },
            {
              lists: [{ field: 'API Provider', value: '{{apiProvider}}' }],
            },
            {
              text: 'You can now access the approved APIs immediately by logging in to our platform and navigating to your dashboard.',
            },
          ],
        }),
      ],
    );

    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.COMPANY_KYB_DENIED,
        'Your API Access Request',
        template({
          title: 'Your API Access Request',
          body: [
            { text: 'Hi {{name}},' },
            {
              text: 'Your API Access was rejected because {{reason}}.',
            },
            { text: 'Do reach out to support for further assistance.' },
          ],
        }),
      ],
    );

    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.VERIFY_EMAIL,
        'Let’s get started, Verify your Email',
        template({
          title: 'Let’s get started, Verify your Email',
          body: [
            { text: 'Hi {{name}},' },
            {
              text: 'Thank you for creating your account on {{apiProvider}}.',
            },
            {
              text: 'For security purposes, use the OTP below to verify your email address.',
            },
            { text: '{{otp}}' },
          ],
        }),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
