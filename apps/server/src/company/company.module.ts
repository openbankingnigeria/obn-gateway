import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, User } from '@common/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, Company])],
  controllers: [CompanyController],
  providers: [CompanyService, FileHelpers, RequestContextService],
})
export class CompanyModule {}
