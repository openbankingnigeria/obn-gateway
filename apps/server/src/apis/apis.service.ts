import { Collection } from '@common/database/entities/collection.entity';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { IBadRequestException } from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { Not, Repository } from 'typeorm';
import {
  CreateAPIDto,
  GETAPIRouteResponseDTO,
  GetAPIResponseDTO,
  UpdateAPIDto,
} from './dto/index.dto';
import slugify from 'slugify';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { apiErrorMessages, apiSuccessMessages } from './apis.constants';

// TODO return DTO based on parent type, i.e. we dont want to return sensitive API info data to API consumer for e.g.
@Injectable()
export class APIService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionRoute)
    private readonly routeRepository: Repository<CollectionRoute>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
  ) {}

  async viewAPIs(
    environment: KONG_ENVIRONMENT,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const [routes, totalNumberOfRecords] =
      await this.routeRepository.findAndCount({
        where: { ...filters, environment },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: { collection: true },
      });

    const [gatewayServices, gatewayRoutes] = await Promise.all([
      this.kongService.listServices(environment, {
        tags: routes.map((route) => route.collection.slug!),
      }),
      this.kongRouteService.listRoutes(environment, {
        tags: routes.map((route) => route.collection.slug!),
      }),
    ]);

    // TODO emit event
    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPIs,
      routes.map((route) => {
        const gatewayRoute = gatewayRoutes.data.find(
          (gatewayRoute) => gatewayRoute.id === route.routeId,
        )!;
        const gatewayService = gatewayServices.data.find(
          (gatewayService) => gatewayService.id === route.serviceId,
        )!;
        return new GetAPIResponseDTO({
          id: route.id,
          name: route.name,
          enabled: route.enabled,
          host: gatewayService?.host || null,
          protocol: gatewayService?.protocol || null,
          port: gatewayService?.port || null,
          path: gatewayService?.path || null,
          url: gatewayService
            ? `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`
            : null,
          route: {
            paths: gatewayRoute?.paths || [],
            methods: gatewayRoute?.methods || [],
          },
        });
      }),
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async viewAPI(environment: KONG_ENVIRONMENT, id: string) {
    const route = await this.routeRepository.findOne({
      where: { id, environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new IBadRequestException({
        message: apiErrorMessages.routeNotFound(id),
      });
    }

    let gatewayService = null;
    let gatewayRoutes = null;
    if (route.serviceId) {
      gatewayService = await this.kongService.getService(
        environment,
        route.serviceId,
      );
      gatewayRoutes = await this.kongService.getServiceRoutes(
        environment,
        route.serviceId,
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPI,
      new GetAPIResponseDTO({
        id: route.id,
        name: route.name,
        enabled: route.enabled,
        host: gatewayService?.host || null,
        protocol: gatewayService?.protocol || null,
        port: gatewayService?.port || null,
        path: gatewayService?.path || null,
        url: gatewayService
          ? `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`
          : null,
        route: new GETAPIRouteResponseDTO({
          paths: gatewayRoutes?.data[0]?.paths || [],
          methods: gatewayRoutes?.data[0]?.methods || [],
        }),
      }),
    );
  }

  async deleteAPI(environment: KONG_ENVIRONMENT, id: string) {
    const route = await this.routeRepository.findOne({
      where: { id, environment },
    });

    if (!route) {
      throw new IBadRequestException({
        message: apiErrorMessages.routeNotFound(id),
      });
    }

    if (route.routeId) {
      await this.kongRouteService.deleteRoute(environment, route.routeId);
    }

    await this.routeRepository.softDelete({
      id,
      environment,
    });

    // TODO emit event

    return ResponseFormatter.success(apiSuccessMessages.deletedAPI);
  }

  async createAPI(environment: KONG_ENVIRONMENT, data: CreateAPIDto) {
    const { name, enabled, url } = data;
    const { paths, methods } = data.route;

    const collection = await this.collectionRepository.findOne({
      where: { id: data.collectionId },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: apiErrorMessages.collectionNotFound(data.collectionId),
      });
    }

    const routeExists = await this.routeRepository.countBy({
      name,
      environment,
    });
    if (routeExists) {
      throw new IBadRequestException({
        message: apiErrorMessages.routeExists(name),
      });
    }

    const hostname = new URL(url).hostname;
    const gatewayService = await this.kongService.updateOrCreateService(
      environment,
      {
        name: hostname,
        enabled: true,
        url,
        retries: 1,
        tags: [collection.slug!],
      },
    );

    const gatewayRoute = await this.kongRouteService.createRoute(environment, {
      name: slugify(name, { lower: true, strict: true }),
      tags: [collection.slug!],
      paths,
      methods,
      service: {
        id: gatewayService.id,
      },
    });

    const createdRoute = await this.routeRepository.save(
      this.routeRepository.create({
        name,
        environment,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId: data.collectionId,
        enabled,
      }),
    );

    if (enabled === true) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: false,
        },
      );
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: true,
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.createdAPI,
      new GetAPIResponseDTO({
        id: createdRoute.id,
        name: createdRoute.name,
        enabled: createdRoute.enabled,
        host: gatewayService.host,
        protocol: gatewayService.protocol,
        port: gatewayService.port,
        path: gatewayService.path,
        url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
        route: data.route,
      }),
    );
  }

  async updateAPI(
    environment: KONG_ENVIRONMENT,
    routeId: string,
    data: UpdateAPIDto,
  ) {
    const { name, enabled, url } = data;
    const { paths, methods } = data.route;

    const route = await this.routeRepository.findOne({
      where: { id: routeId, environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new IBadRequestException({
        message: apiErrorMessages.routeNotFound(routeId),
      });
    }

    const routeExists = await this.routeRepository.countBy({
      id: Not(routeId),
      environment,
      name,
    });
    if (routeExists) {
      throw new IBadRequestException({
        message: apiErrorMessages.routeExists(name),
      });
    }

    const hostname = new URL(url).hostname;
    const gatewayService = await this.kongService.updateOrCreateService(
      environment,
      {
        name: hostname,
        enabled: true,
        url,
        retries: 1,
        tags: [route.collection.slug!],
      },
    );

    let gatewayRoute;
    if (route.routeId) {
      gatewayRoute = await this.kongRouteService.updateRoute(
        environment,
        route.routeId,
        {
          name: slugify(name, { lower: true, strict: true }),
          paths,
          methods,
        },
      );
    } else {
      gatewayRoute = await this.kongRouteService.createRoute(environment, {
        name: slugify(name, { lower: true, strict: true }),
        tags: [route.collection.slug!],
        paths,
        methods,
        service: {
          id: gatewayService.id,
        },
      });
    }

    await this.routeRepository.update(
      { id: route.id, environment },
      {
        name,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        enabled,
      },
    );

    if (enabled === true) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: false,
        },
      );
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: true,
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.updatedAPI,
      new GetAPIResponseDTO({
        id: route.id,
        name: route.name,
        enabled: route.enabled,
        host: gatewayService.host,
        protocol: gatewayService.protocol,
        port: gatewayService.port,
        path: gatewayService.path,
        url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
        route: data.route,
      }),
    );
  }
}
