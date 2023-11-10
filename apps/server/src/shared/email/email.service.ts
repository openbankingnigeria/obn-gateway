import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { USER_EVENTS, UserCreatedEvent } from '../events/user.event';
import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT!),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

@Injectable()
export class EmailService {
  @OnEvent(USER_EVENTS.USER_CREATED)
  handleUserCreatedEvent(event: UserCreatedEvent) {
    this.sendWelcomeEmail(event.user.email, event.user.resetPasswordToken);
  }

  private async sendWelcomeEmail(email: string, token?: string) {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'OBN Invite',
      html: token,
    });
    console.log('Message sent: %s', info.messageId);
  }
}
