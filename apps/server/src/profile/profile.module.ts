import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, User } from 'src/common/database/entities';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, RequestContextService],
  imports: [TypeOrmModule.forFeature([Profile, User])],
})
export class ProfileModule {}
