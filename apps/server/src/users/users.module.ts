import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, Role, User } from 'src/common/database/entities';
import { Auth } from 'src/common/utils/authentication/auth.helper';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RequestContextService, Auth, JwtService],
  imports: [TypeOrmModule.forFeature([User, Role, Profile])],
})
export class UsersModule {}
