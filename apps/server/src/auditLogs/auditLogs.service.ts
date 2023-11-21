import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { auditLogsSuccessMessages } from 'src/common/constants/auditLogs/auditLogs.constants';
import { AuditLog } from 'src/common/database/entities';
import { Repository } from 'typeorm';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { ResponseFormatter } from '@common/utils/common/response.util';
import { ROLES } from '@roles/types';
import { INotFoundException } from '@common/utils/exceptions/exceptions';
import { auditLogErrors } from '@common/constants/errors/auditLogs.errors';
import { BaseEvent } from '@shared/events/base.event';

@Injectable()
export class AuditLogsService {
  constructor(
    private readonly requestContext: RequestContextService,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  @OnEvent('**')
  async logEvent(event: BaseEvent) {
    await this.auditLogRepository.save(
      {
        companyId: event.author?.companyId,
        userId: event.author?.id,
        details: event.metadata,
        event: event.name,
      },
      { reload: false },
    );
  }

  async getLogs({ limit, page }: PaginationParameters, filters?: any) {
    const companyFilter: any = {};

    if (this.requestContext.user!.role.parent?.slug === ROLES.API_CONSUMER) {
      companyFilter.companyId = this.requestContext.user?.companyId;
    }

    const totalLogs = await this.auditLogRepository.count({
      where: {
        ...filters,
        ...companyFilter,
      },
    });

    const logs = await this.auditLogRepository.find({
      where: { ...filters, ...companyFilter },
      skip: (page - 1) * limit,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
      relations: {
        user: {
          profile: true,
        },
      },
    });

    return ResponseFormatter.success(auditLogsSuccessMessages.fetchLogs, logs, {
      totalNumberOfRecords: totalLogs,
      totalNumberOfPages: Math.ceil(totalLogs / limit),
      pageNumber: page,
      pageSize: limit,
    });
  }

  async getSingleLog(id: string) {
    const log = await this.auditLogRepository.findOne({
      where: {
        id,
      },
      relations: {
        user: {
          profile: true,
        },
      },
    });

    if (!log) {
      throw new INotFoundException({
        message: auditLogErrors.logWithIdNotFound(id),
      });
    }

    return ResponseFormatter.success(auditLogsSuccessMessages.fetchLog, log);
  }
}
