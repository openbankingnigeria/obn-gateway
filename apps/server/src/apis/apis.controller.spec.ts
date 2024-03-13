import { Test, TestingModule } from '@nestjs/testing';
import { APIController } from './apis.controller';
import { APIService } from './apis.service';
import { RequestContext } from '@common/utils/request/request-context';
import { CollectionRoute, User } from '@common/database/entities';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';

const moduleMocker = new ModuleMocker(global);

describe('APIController', () => {
  let controller: APIController;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [APIController],
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

    controller = module.get<APIController>(APIController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('viewAPIs', () => {
    it('should call apiService.viewAPIs with the correct parameters', async () => {
      const ctx = new RequestContext({ user: new User() });
      const params: { environment: KONG_ENVIRONMENT } = {
        environment: KONG_ENVIRONMENT.DEVELOPMENT,
      };
      const pagination = { page: 1, limit: 10 };
      const filters = {};

      const apiService = module.get<APIService>(APIService);
      jest.spyOn(apiService, 'viewAPIs').mockResolvedValue({
        data: [],
        status: 'success',
        message: 'Success',
      });

      await controller.viewAPIs(ctx, params, pagination, filters);

      expect(apiService.viewAPIs).toHaveBeenCalledWith(
        ctx,
        params.environment,
        pagination,
        filters,
      );
    });
  });
});
