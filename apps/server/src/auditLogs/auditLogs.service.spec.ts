import { Test, TestingModule } from '@nestjs/testing';
import { AuditlogsService } from './auditLogs.service';

describe('AuditlogsService', () => {
  let service: AuditlogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditlogsService],
    }).compile();

    service = module.get<AuditlogsService>(AuditlogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
