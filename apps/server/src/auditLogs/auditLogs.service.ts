import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { auditLogsSuccessMessages } from './auditLogs.constants';
import { AuditLog } from '@common/database/entities';
import { Equal, Repository } from 'typeorm';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { INotFoundException } from '@common/utils/exceptions/exceptions';
import { auditLogErrors } from '@auditLogs/auditLogs.errors';
import { BaseEvent } from '@shared/events/base.event';
import { CompanyTypes } from '@common/database/constants';
import { GetAuditLogResponseDTO } from './dto/index.dto';
import { RequestContext } from '@common/utils/request/request-context';

@Injectable()
export class AuditLogsService {
  constructor(
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

  async getLogs(
    ctx: RequestContext,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const companyFilter: any = {};

    if (ctx.activeCompany.type !== CompanyTypes.API_PROVIDER) {
      companyFilter.companyId = ctx.activeUser.companyId;
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

    // TODO emit event

    return ResponseFormatter.success(
      auditLogsSuccessMessages.fetchLogs,
      logs.map((log) => new GetAuditLogResponseDTO(log)),
      new ResponseMetaDTO({
        totalNumberOfRecords: totalLogs,
        totalNumberOfPages: Math.ceil(totalLogs / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async getSingleLog(ctx: RequestContext, id: string) {
    const log = await this.auditLogRepository.findOne({
      where: {
        id: Equal(id),
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

    // TODO emit event

    return ResponseFormatter.success(
      auditLogsSuccessMessages.fetchLog,
      new GetAuditLogResponseDTO(log),
    );
  }
}
