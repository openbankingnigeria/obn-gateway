import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/common/database/entities/role.entity';
import { Permission } from 'src/common/database/entities/permission.entity';
import { RolePermission } from 'src/common/database/entities/rolepermission.entity';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission])],
})
export class RolesModule {}
