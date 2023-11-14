import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuditLogsService } from './auditLogs.service';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe, FilterTypes } from '@common/utils/pipes/query/filter.pipe';
import { RequiredPermission } from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';

@Controller('audit-trail')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @RequiredPermission(PERMISSIONS.LIST_AUDIT_LOGS)
  getLogs(
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(
      new FilterPipe([
        { key: 'event', type: FilterTypes.VALUE },
        { key: 'createdAt-gt', type: FilterTypes.RANGE, valueType: 'date' },
        { key: 'createdAt-lt', type: FilterTypes.RANGE, valueType: 'date' },
      ]),
    )
    filters: any,
  ) {
    return this.auditLogsService.getLogs(pagination, filters);
  }

  @Get(':id')
  getLogById(@Param('id') logId: string) {
    return this.auditLogsService.getSingleLog(logId);
  }
}
