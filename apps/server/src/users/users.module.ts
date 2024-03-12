import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, Role, User } from '@common/database/entities';
import { Auth } from '@common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, Auth, JwtService],
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
})
export class UsersModule {}
