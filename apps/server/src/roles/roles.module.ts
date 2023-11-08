import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/common/database/entities/role.entity';
import { RequestContextService } from 'src/common/utils/request/request-context.service';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RequestContextService],
  imports: [TypeOrmModule.forFeature([Role])],
})
export class RolesModule {}
