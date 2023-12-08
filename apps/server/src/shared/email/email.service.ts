import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import {
  UserEvents,
  UserCreatedEvent,
  UserDeactivatedEvent,
  UserReactivatedEvent,
} from '../events/user.event';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplate } from '@common/database/entities/emailtemplate.entity';
import { Repository } from 'typeorm';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import Handlebars from 'handlebars';
import { Company, User } from '@common/database/entities';
import {
  CompanyTypes,
  EMAIL_TEMPLATES,
  ROLES,
} from '@common/database/constants';
import {
  AuthEvents,
  AuthResetPasswordEvent,
  AuthResetPasswordRequestEvent,
  AuthSetPasswordEvent,
  AuthSignupEvent,
} from '@shared/events/auth.event';

@Injectable()
export class EmailService {
  transporter: nodemailer.Transporter;
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.transporter = nodemailer.createTransport(config.get('email'));
  }

  @OnEvent(UserEvents.USER_CREATED)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const company = await this.companyRepository.findOneOrFail({
      where: { type: CompanyTypes.API_PROVIDER },
      order: { id: 'ASC' },
    });
    this.sendEmail(EMAIL_TEMPLATES.USER_INVITE, event.user.email, {
      invitationUrl: `${this.config.get(
        'server.managementUrl',
      )}/account-setup?token=${event.metadata.token}`,
      companyName: company.name!,
    });
  }

  // TODO send to api provider user capable of accepting invites
  @OnEvent(AuthEvents.SIGN_UP)
  async handleUserSignupEvent(event: AuthSignupEvent) {
    const user = await this.userRepository.findOneOrFail({
      where: {
        company: { type: CompanyTypes.API_PROVIDER },
        role: { parent: { slug: ROLES.API_PROVIDER } },
      },
    });
    this.sendEmail(EMAIL_TEMPLATES.ACCESS_REQUEST, user.email, {
      name: event.author.company?.name || '',
      email: event.author.email,
    });
  }

  @OnEvent(UserEvents.USER_DEACTIVATED)
  handleUserDeactivatedEvent(event: UserDeactivatedEvent) {
    this.sendEmail(EMAIL_TEMPLATES.USER_DEACTIVATED, event.user.email, {
      firstName: event.user.profile?.firstName || '',
    });
  }

  @OnEvent(UserEvents.USER_REACTIVATED)
  async handleUserReactivatedEvent(event: UserReactivatedEvent) {
    const company = await this.companyRepository.findOneOrFail({
      where: { type: CompanyTypes.API_PROVIDER },
      order: { id: 'ASC' },
    });
    this.sendEmail(EMAIL_TEMPLATES.USER_REACTIVATED, event.user.email, {
      firstName: event.user.profile?.firstName || '',
      companyName: company.name!,
    });
  }

  @OnEvent(AuthEvents.SET_PASSWORD)
  handleUserSetPasswordEvent(event: AuthSetPasswordEvent) {
    this.sendEmail(EMAIL_TEMPLATES.SET_PASSWORD, event.user.email, {
      firstName: event.user.profile?.firstName || '',
    });
  }

  @OnEvent(AuthEvents.RESET_PASSWORD_REQUEST)
  async handleUserResetPasswordRequestEvent(
    event: AuthResetPasswordRequestEvent,
  ) {
    const company = await this.companyRepository.findOneOrFail({
      where: { type: CompanyTypes.API_PROVIDER },
      order: { id: 'ASC' },
    });
    this.sendEmail(EMAIL_TEMPLATES.RESET_PASSWORD_REQUEST, event.user.email, {
      firstName: event.user.profile?.firstName || '',
      resetUrl: `${this.config.get(
        'server.managementUrl',
      )}/reset-password?token=${event.metadata.token}`,
      companyName: company.name!,
    });
  }

  @OnEvent(AuthEvents.RESET_PASSWORD)
  handleUserResetPasswordEvent(event: AuthResetPasswordEvent) {
    this.sendEmail(EMAIL_TEMPLATES.RESET_PASSWORD, event.user.email, {
      firstName: event.user.profile?.firstName || '',
    });
  }

  private async sendEmail(
    templateSlug: string,
    recipient: string,
    data: Record<string, string>,
  ) {
    const template = await this.templateRepository.findOneBy({
      slug: templateSlug,
    });
    if (!template) {
      throw new IBadRequestException({
        message: 'email template does not exist',
      });
    }

    const info = await this.transporter.sendMail({
      from: this.config.get('email.from'),
      to: recipient,
      subject: Handlebars.compile(template.title)(data),
      html: Handlebars.compile(template.body.toString())(data),
    });

    console.log('Message sent: %s', info.messageId);
  }
}
