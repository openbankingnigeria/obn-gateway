import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AppService } from './app.service';

const moduleMocker = new ModuleMocker(global);

describe('AppController', () => {
  let appController: AppController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [AppController],
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

    appController = module.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should call AppService.health', async () => {
      const appService = module.get<AppService>(AppService);

      const spy = jest.spyOn(appService, 'health');

      appController.health();

      expect(spy).toHaveBeenCalled();
    });
  });
});
