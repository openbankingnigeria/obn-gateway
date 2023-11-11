import { Module } from '@nestjs/common';
import { AuditLogsService } from './auditLogs.service';
import { AuditLogsController } from './auditLogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from 'src/common/database/entities';
import { RequestContextService } from '@common/utils/request/request-context.service';

@Module({
  controllers: [AuditLogsController],
  providers: [AuditLogsService, RequestContextService],
  imports: [TypeOrmModule.forFeature([AuditLog])],
})
export class AuditLogsModule {}
