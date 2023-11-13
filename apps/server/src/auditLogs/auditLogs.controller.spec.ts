import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsController } from './auditLogs.controller';
import { AuditLogsService } from './auditLogs.service';

describe('AuditLogsController', () => {
  let controller: AuditLogsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditLogsController],
      providers: [AuditLogsService],
    }).compile();

    controller = module.get<AuditLogsController>(AuditLogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
