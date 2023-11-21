import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditLogsService } from './auditLogs.service';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import { RequiredPermission } from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { AuditLogFilters } from '@common/constants/auditLogs/filter.constants';

@Controller('audit-trail')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequiredPermission(PERMISSIONS.LIST_AUDIT_LOGS)
  getLogs(
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(AuditLogFilters.getLogs))
    filters: any,
  ) {
    return this.auditLogsService.getLogs(pagination, filters);
  }

  @Get(':id')
  getLogById(@Param('id') logId: string) {
    return this.auditLogsService.getSingleLog(logId);
  }
}
