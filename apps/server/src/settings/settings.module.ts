import { Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Settings } from '@common/database/entities';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([Settings, Company]), HttpModule],
  controllers: [SettingsController],
  providers: [SettingsService, KongConsumerService],
})
export class SettingsModule {}
