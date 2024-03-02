import { Test, TestingModule } from '@nestjs/testing';
import { APIService } from './apis.service';

describe('APIService', () => {
  let service: APIService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [APIService],
    }).compile();

    service = module.get<APIService>(APIService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
