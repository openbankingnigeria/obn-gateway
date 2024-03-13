import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile, TwoFaBackupCode, User } from '@common/database/entities';

const moduleMocker = new ModuleMocker(global);

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfileService],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'sqlite',
              database: ':memory:',
            };
          },
        }),
        TypeOrmModule.forFeature([Profile, User, TwoFaBackupCode]),
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

    service = module.get<ProfileService>(ProfileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
