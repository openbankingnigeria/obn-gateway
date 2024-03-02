import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Profile, Settings, User } from 'src/common/database/entities';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/database/entities/role.entity';
import { TwoFaBackupCode } from '@common/database/entities/twofabackupcode.entity';
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
