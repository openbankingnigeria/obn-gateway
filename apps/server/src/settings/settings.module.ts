import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  Settings,
  User,
  EmailTemplate,
} from '@common/database/entities';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([Settings, EmailTemplate, Company, User]),
    HttpModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService, KongConsumerService],
})
export class SettingsModule {}
