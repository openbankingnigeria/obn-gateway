import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';

import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Company,
  EmailTemplate,
  Settings,
  User,
} from '@common/database/entities';
const moduleMocker = new ModuleMocker(global);

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SettingsService],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'sqlite',
              database: ':memory:',
            };
          },
        }),
        TypeOrmModule.forFeature([Settings, EmailTemplate, Company, User]),
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

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
