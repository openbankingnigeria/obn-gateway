import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User } from 'src/common/database/entities';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RequestContextService],
  imports: [TypeOrmModule.forFeature([User, Role])],
})
export class UsersModule {}
