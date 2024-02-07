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
import { Company, Settings, User } from '@common/database/entities';
import {
  CompanyTypes,
  EMAIL_TEMPLATES,
  ROLES,
} from '@common/database/constants';
import {
  AuthEvents,
  AuthResendOtpEvent,
  AuthResetPasswordEvent,
  AuthResetPasswordRequestEvent,
  AuthSetPasswordEvent,
  AuthSignupEvent,
} from '@shared/events/auth.event';
import {
  CompanyApprovedEvent,
  CompanyDeniedEvent,
  CompanyEvents,
} from '@shared/events/company.event';
import { BUSINESS_SETTINGS_NAME } from '@settings/settings.constants';
import { EmailSettingsInterface, SETTINGS_TYPES } from '@settings/types';
import * as moment from 'moment';

@Injectable()
export class EmailService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(EmailTemplate)
    private readonly templateRepository: Repository<EmailTemplate>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(Settings)
    private readonly settingsRepository: Repository<Settings>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  protected async loadEmailTransporter() {
    let transporter: nodemailer.Transporter;
    const apBusinessSettings = await this.settingsRepository.findOne({
      where: {
        name: BUSINESS_SETTINGS_NAME,
      },
    });

    if (apBusinessSettings) {
      const emailSettings = await this.settingsRepository.findOne({
        where: {
          name: SETTINGS_TYPES.EMAIL_SETTINGS,
        },
      });

      if (emailSettings) {
        const emailSettingsValue: EmailSettingsInterface = JSON.parse(
          emailSettings.value,
        );

        const {
          emailFrom,
          emailHost,
          emailPassword,
          emailPort,
          emailSecure,
          emailUser,
        } = emailSettingsValue;

        if (
          emailFrom &&
          emailHost &&
          emailPassword &&
          emailPort &&
          emailSecure &&
          emailUser
        ) {
          transporter = nodemailer.createTransport({
            from: emailFrom.value,
            host: emailHost.value,
            auth: {
              user: emailUser.value,
              pass: emailPassword.value,
            },
            port: emailPort.value,
            secure: emailSecure.value,
          } as any);
        } else {
          transporter = nodemailer.createTransport(this.config.get('email'));
        }
      } else {
        transporter = nodemailer.createTransport(this.config.get('email'));
      }
    } else {
      transporter = nodemailer.createTransport(this.config.get('email'));
    }

    return transporter;
  }

  @OnEvent(UserEvents.USER_CREATED)
  protected async handleUserCreatedEvent(event: UserCreatedEvent) {
    try {
      const company = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      this.sendEmail(EMAIL_TEMPLATES.USER_INVITE, event.user.email, {
        invitationUrl: `${this.config.get(
          'system.managementUrl',
        )}/account-setup?token=${event.metadata.token}`,
        companyName: company.name!,
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(UserEvents.USER_DEACTIVATED)
  protected async handleUserDeactivatedEvent(event: UserDeactivatedEvent) {
    try {
      await this.sendEmail(EMAIL_TEMPLATES.USER_DEACTIVATED, event.user.email, {
        firstName: event.user.profile?.firstName || '',
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(UserEvents.USER_REACTIVATED)
  protected async handleUserReactivatedEvent(event: UserReactivatedEvent) {
    try {
      const company = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      await this.sendEmail(EMAIL_TEMPLATES.USER_REACTIVATED, event.user.email, {
        firstName: event.user.profile?.firstName || '',
        companyName: company.name!,
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(AuthEvents.SET_PASSWORD)
  protected async handleUserSetPasswordEvent(event: AuthSetPasswordEvent) {
    try {
      await this.sendEmail(EMAIL_TEMPLATES.SET_PASSWORD, event.user.email, {
        firstName: event.user.profile?.firstName || '',
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(AuthEvents.RESET_PASSWORD_REQUEST)
  protected async handleUserResetPasswordRequestEvent(
    event: AuthResetPasswordRequestEvent,
  ) {
    try {
      const company = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      await this.sendEmail(
        EMAIL_TEMPLATES.RESET_PASSWORD_REQUEST,
        event.user.email,
        {
          firstName: event.user.profile?.firstName || '',
          resetUrl: `${this.config.get(
            'system.managementUrl',
          )}/reset-password?token=${event.metadata.token}`,
          companyName: company.name!,
        },
      );
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(AuthEvents.RESET_PASSWORD)
  protected async handleUserResetPasswordEvent(event: AuthResetPasswordEvent) {
    try {
      await this.sendEmail(EMAIL_TEMPLATES.RESET_PASSWORD, event.user.email, {
        firstName: event.user.profile?.firstName || '',
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(CompanyEvents.COMPANY_KYB_APPROVED)
  protected async handleApproveCompanyKyb(event: CompanyApprovedEvent) {
    try {
      const apiProvider = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      const admins = await this.userRepository.find({
        where: {
          companyId: event.company.id,
          role: {
            slug: ROLES.ADMIN,
          },
        },
        relations: {
          profile: true,
        },
      });
      admins.forEach((admin) => {
        this.sendEmail(EMAIL_TEMPLATES.COMPANY_KYB_DENIED, admin.email, {
          name: admin.profile!.firstName,
          apiProvider: apiProvider.name!,
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(CompanyEvents.COMPANY_KYB_DENIED)
  protected async handleDenyCompanyKyb(event: CompanyDeniedEvent) {
    try {
      const admins = await this.userRepository.find({
        where: {
          companyId: event.company.id,
          role: {
            slug: ROLES.ADMIN,
          },
        },
        relations: {
          profile: true,
        },
      });
      admins.forEach((admin) => {
        this.sendEmail(EMAIL_TEMPLATES.COMPANY_KYB_DENIED, admin.email, {
          name: admin.profile!.firstName,
          reason: event.metadata.reason,
        });
      });
    } catch (error) {
      console.error(error);
    }
  }

  @OnEvent(AuthEvents.SIGN_UP)
  protected async handleResendOtp(event: AuthResendOtpEvent) {
    try {
      const apiProvider = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      this.sendEmail(EMAIL_TEMPLATES.VERIFY_EMAIL, event.author.email, {
        apiProvider: apiProvider.name!,
        otp: event.metadata.otp!,
        name: event.author.profile!.firstName,
      });
    } catch (error) {
      console.error(error);
    }
  }

  protected async handleVerifyEmail(event: AuthSignupEvent) {
    try {
      const apiProvider = await this.companyRepository.findOneOrFail({
        where: { type: CompanyTypes.API_PROVIDER },
        order: { id: 'ASC' },
      });
      await this.sendEmail(EMAIL_TEMPLATES.VERIFY_EMAIL, event.author.email, {
        apiProvider: apiProvider.name!,
        name: event.author.profile!.firstName,
        otp: event.metadata.otp,
      });
    } catch (error) {
      console.error(error);
    }
  }

  private async sendEmail(
    templateSlug: string,
    recipient: string,
    data: Record<string, string>,
  ) {
    const transporter = await this.loadEmailTransporter();
    try {
      const template = await this.templateRepository.findOneBy({
        slug: templateSlug,
      });
      if (!template) {
        throw new IBadRequestException({
          message: 'email template does not exist',
        });
      }

      const $timing = {
        year: moment().year(),
        month: moment().month() + 1,
        day: moment().date(),
      };

      Object.assign({}, { $timing }, data);

      const mailOptions = {
        from: transporter.options.from,
        to: recipient,
        subject: Handlebars.compile(template.title)(data),
        html: Handlebars.compile(template.body.toString())(data),
      };

      console.log('Sending mail to: ', mailOptions.to);

      const info = await transporter.sendMail(mailOptions);

      console.log('Mail sent: %s', info.messageId);
    } catch (error) {
      console.error(error);
    }
  }
}
