import * as fs from 'fs';
import { MigrationInterface, QueryRunner } from 'typeorm';
import Handlebars from 'handlebars';
import { EMAIL_TEMPLATES } from '../constants';
import { v4 as uuidv4 } from 'uuid';

export class Migration1702020894826 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const file = fs.readFileSync(
      __dirname + '/../../../shared/email/template.html',
    );
    const template = Handlebars.compile(file.toString());
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.ACCESS_REQUEST,
        'Access Request from {{name}}',
        template({
          title: 'Access Request from {{name}}',
          body: [
            { text: 'Hello There,' },
            { text: 'An API Consumer has requested access.' },
            { text: 'Here are the details of the access request:' },
            {
              lists: [
                { field: 'AC Name', value: '{{name}}' },
                { field: 'AC Email', value: '{{email}}' },
              ],
            },
          ],
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.USER_INVITE,
        'Team member Invite',
        template({
          title: 'Team member Invite',
          body: [
            { text: 'Hello There,' },
            {
              text: 'You have been invited you to join the {{companyName}} Portal.',
            },
            {
              text: 'To get started, please click on the link below to complete your profile and access the portal. ',
            },
          ],
          cta: { field: 'Complete Profile', value: '{{invitationUrl}}' },
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.USER_DEACTIVATED,
        'Account Update',
        template({
          title: 'Account Update',
          body: [
            { text: 'Hello {{firstName}}' },
            {
              text: 'Your account has been deactivated.',
            },
            {
              text: 'Do reach out to system administration for further assistance.',
            },
          ],
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.USER_REACTIVATED,
        'Account Update',
        template({
          title: 'Account Update',
          body: [
            { text: 'Hello {{firstName}}' },
            {
              text: 'Your access to the {{companyName}} portal has been activated.',
            },
            {
              text: 'You can now log in and access it.',
            },
          ],
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.SET_PASSWORD,
        'Password Set Successfully',
        template({
          title: 'Password Set Successfully',
          body: [
            { text: 'Hello {{firstName}}' },
            {
              text: 'We wanted to let you know that your password was successfully set.',
            },
          ],
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.RESET_PASSWORD_REQUEST,
        'Password Reset Link',
        template({
          title: 'Password Reset Link',
          body: [
            { text: 'Hello {{firstName}}' },
            {
              text: 'You have requested to reset your password on {{companyName}} Portal',
            },
            {
              text: 'Click on the button below to reset your password',
            },
          ],
          cta: { field: 'Reset Password', value: '{{resetUrl}}' },
        }),
      ],
    );
    await queryRunner.query(
      `INSERT INTO email_templates (id, slug, title, body) VALUES (?, ?, ?, ?)`,
      [
        uuidv4(),
        EMAIL_TEMPLATES.RESET_PASSWORD,
        'Password Reset',
        template({
          title: 'Password Reset',
          body: [
            { text: 'Hello {{firstName}}' },
            {
              text: 'We wanted to let you know that your password was successfully changed. ',
            },
          ],
        }),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
