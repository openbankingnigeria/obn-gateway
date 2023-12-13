import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, User } from 'src/common/database/entities';
import { TwoFaBackupCode } from '@common/database/entities/twofabackupcode.entity';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, RequestContextService],
  imports: [TypeOrmModule.forFeature([Profile, User, TwoFaBackupCode])],
})
export class ProfileModule {}
