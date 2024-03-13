import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import {
  Company,
  Settings,
  User,
  CompanyKybData,
} from '@common/database/entities';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { TypeOrmModule } from '@nestjs/typeorm';
const moduleMocker = new ModuleMocker(global);

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanyService],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'sqlite',
              database: ':memory:',
            };
          },
        }),
        TypeOrmModule.forFeature([User, Company, Settings, CompanyKybData]),
      ],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
