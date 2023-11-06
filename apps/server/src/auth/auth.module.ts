import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company, Profile, User } from 'src/common/database/entities';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, Auth, JwtService],
  imports: [TypeOrmModule.forFeature([User, Profile, Company])],
})
export class AuthModule {}
