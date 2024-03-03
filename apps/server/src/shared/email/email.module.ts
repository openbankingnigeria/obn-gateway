import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailTemplate } from '@common/database/entities/emailtemplate.entity';
import { Company, Settings, User } from '@common/database/entities';

@Module({
  providers: [EmailService],
  imports: [TypeOrmModule.forFeature([EmailTemplate, Company, User, Settings])],
})
export class EmailModule {}
