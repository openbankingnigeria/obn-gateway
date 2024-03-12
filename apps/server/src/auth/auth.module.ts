import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  Profile,
  Settings,
  User,
  Role,
  TwoFaBackupCode,
} from '@common/database/entities';
import { Auth } from '@common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Auth, JwtService, KongConsumerService],
  imports: [
    TypeOrmModule.forFeature([
      User,
      Profile,
      Company,
      Role,
      TwoFaBackupCode,
      Settings,
    ]),
    HttpModule,
  ],
})
export class AuthModule {}
