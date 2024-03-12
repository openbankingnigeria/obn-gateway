import { Module } from '@nestjs/common';
import { AuditLogsService } from './auditLogs.service';
import { AuditLogsController } from './auditLogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '@common/database/entities';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService],
  imports: [TypeOrmModule.forFeature([AuditLog])],
})
export class AuditLogsModule {}
