import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { USER_EVENTS, UserCreatedEvent } from '../events/user.event';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  transporter: nodemailer.Transporter;
  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport(config.get('email'));
  }

  @OnEvent(USER_EVENTS.USER_CREATED)
  handleUserCreatedEvent(event: UserCreatedEvent) {
    this.sendWelcomeEmail(event.user.email, event.token);
  }

  private async sendWelcomeEmail(email: string, token?: string) {
    const info = await this.transporter.sendMail({
      from: this.config.get('email.from'),
      to: email,
      subject: 'OBN Invite',
      html: `${this.config.get(
        'server.managementUrl',
      )}/account-setup?token=${token}`,
    });
    console.log('Message sent: %s', info.messageId);
  }
}
