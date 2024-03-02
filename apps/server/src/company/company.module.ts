import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Settings, User } from '@common/database/entities';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { HttpModule } from '@nestjs/axios';
import { CompanyKybData } from '@common/database/entities/company-kyb.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, Settings, CompanyKybData]),
    HttpModule,
  ],
  controllers: [CompanyController],
  providers: [CompanyService, FileHelpers, KongConsumerService],
})
export class CompanyModule {}
