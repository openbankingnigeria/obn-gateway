import { EmailTemplate } from '@common/database/entities';
import { EntityBuilder } from './base.builder';

export class EmailTemplateBuilder extends EntityBuilder<EmailTemplate> {
  constructor() {
    super({
      slug: 'test-template',
      title: 'Test Email Template',
      body: '<p>Test email content</p>',
    });
  }

  protected validate(): boolean {
    return !!this.instance.slug && !!this.instance.title && !!this.instance.body;
  }

  withId(id: string): this {
    return this.with('id', id as any);
  }
}