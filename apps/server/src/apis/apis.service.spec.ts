import { Test, TestingModule } from '@nestjs/testing';
import { APIService } from './apis.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import {
  CollectionRoute,
  Company,
  User,
  Collection,
  Role,
  Permission,
} from '@common/database/entities';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { Equal, Repository } from 'typeorm';
import { PROVIDER_PERMISSIONS } from '@permissions/types';

const moduleMocker = new ModuleMocker(global);

describe('APIService', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [APIService],
      imports: [
        TypeOrmModule.forRootAsync({
          useFactory: () => {
            return {
              type: 'sqlite',
              database: ':memory:',
            };
          },
        }),
        TypeOrmModule.forFeature([CollectionRoute, Company, User, Collection]),
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
  });

  describe('viewAPIs', () => {
    it('should call apiService.viewAPIs with the correct parameters', async () => {
      const ctx = new RequestContext({ user: new User() });
      const params: { environment: KONG_ENVIRONMENT } = {
        environment: KONG_ENVIRONMENT.DEVELOPMENT,
      };
      const pagination = { page: 1, limit: 10 };
      const filters = {};
      const routes: any[] = [];
      const totalNumberOfRecords = 10;
      const gatewayServices: { data: any[] } = { data: [] };
      const gatewayRoutes = { data: [] };

      const routeRepository = module.get<Repository<CollectionRoute>>(
        getRepositoryToken(CollectionRoute),
      );
      jest
        .spyOn(routeRepository, 'findAndCount')
        .mockResolvedValue([routes, totalNumberOfRecords]);

      const kongService = module.get<KongServiceService>(KongServiceService);
      jest
        .spyOn(kongService, 'listServices')
        .mockResolvedValue(gatewayServices);

      const kongRouteService = module.get<KongRouteService>(KongRouteService);
      jest
        .spyOn(kongRouteService, 'listRoutes')
        .mockResolvedValue(gatewayRoutes);

      const apiService = module.get<APIService>(APIService);
      jest.spyOn(apiService, 'viewAPIs');

      await apiService.viewAPIs(ctx, params.environment, pagination, filters);

      expect(apiService.viewAPIs).toHaveBeenCalledWith(
        ctx,
        params.environment,
        pagination,
        filters,
      );

      expect(routeRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('viewAPI', () => {
    it('should call the necessary methods with the correct parameters and return the API', async () => {
      const user = new User(),
        role = new Role(),
        company = new Company();
      role.slug = 'admin';
      user.role = role;
      user.company = company;
      user.role.permissions = Object.values(PROVIDER_PERMISSIONS).map((p) => {
        const permission = new Permission();
        permission.slug = p;
        return permission;
      });
      user.role.parent = user.role;

      const ctx = new RequestContext({ user });
      const environment = KONG_ENVIRONMENT.DEVELOPMENT;
      const idOrSlug = 'test-api';

      const apiService = module.get<APIService>(APIService);
      const routeRepository = module.get<Repository<CollectionRoute>>(
        getRepositoryToken(CollectionRoute),
      );
      const kongService = module.get<KongServiceService>(KongServiceService);
      const kongRouteService = module.get<KongRouteService>(KongRouteService);

      const routeData = new CollectionRoute();
      routeData.serviceId = 'test-service-id';
      routeData.routeId = 'test-route-id';

      jest.spyOn(routeRepository, 'findOne').mockResolvedValue(routeData);

      await apiService.viewAPI(ctx, environment, idOrSlug);

      expect(routeRepository.findOne).toHaveBeenCalledWith({
        where: [
          { id: Equal(idOrSlug), environment },
          { name: Equal(idOrSlug), environment },
        ],
        relations: { collection: true },
      });
      expect(kongService.getService).toHaveBeenCalledWith(
        environment,
        routeData.serviceId,
      );
      expect(kongRouteService.getRoute).toHaveBeenCalledWith(
        environment,
        routeData.routeId,
      );
    });
  });
});
