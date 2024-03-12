import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import {
  Company,
  Settings,
  User,
  EmailTemplate,
} from '@common/database/entities';

@Module({
  providers: [EmailService],
  imports: [TypeOrmModule.forFeature([EmailTemplate, Company, User, Settings])],
})
export class EmailModule {}
