import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Settings, User } from '@common/database/entities';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { HttpModule } from '@nestjs/axios';
import { EmailTemplate } from '@common/database/entities/emailtemplate.entity';
import { EmailService } from '@shared/email/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, EmailTemplate, Company, User]),
    HttpModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, KongConsumerService, EmailService],
})
export class SettingsModule {}
