import { Collection } from '@common/database/entities/collection.entity';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KongRouteService } from '@shared/integrations/kong/route/route.kong.service';
import { KongServiceService } from '@shared/integrations/kong/service/service.kong.service';
import { Not, Repository } from 'typeorm';
import {
  CreateCollectionDto,
  GETAPIRouteResponseDTO,
  GetAPIResponseDTO,
  GetCollectionResponseDTO,
  UpdateAPIDto,
  UpdateCollectionDto,
} from './dto/index.dto';
import slugify from 'slugify';
import {
  collectionErrorMessages,
  collectionsSuccessMessages,
} from './collections.constants';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';

// TODO return DTO based on parent type, i.e. we dont want to return sensitive API info data to API consumer for e.g.
@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionRoute)
    private readonly routeRepository: Repository<CollectionRoute>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
  ) {}

  async listCollections({ limit, page }: PaginationParameters, filters?: any) {
    const [collections, totalNumberOfRecords] =
      await this.collectionRepository.findAndCount({
        where: { ...filters },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    // TODO emit event
    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollections,
      collections.map((collection) => new GetCollectionResponseDTO(collection)),
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async viewCollection(id: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(id),
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async createCollection(data: CreateCollectionDto) {
    const collectionExists = await this.collectionRepository.countBy({
      name: data.name,
    });

    if (collectionExists) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionExists(data.name),
      });
    }

    const { name, description } = data;

    const collection = await this.collectionRepository.save(
      this.collectionRepository.create({
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description,
      }),
    );

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.createdCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async updateCollection(id: string, data: UpdateCollectionDto) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionNotFound(id),
      });
    }

    const { description } = data;

    await this.collectionRepository.update(
      { id: collection.id },
      this.collectionRepository.create({
        description,
      }),
    );

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.updatedCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async deleteCollection(id: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionNotFound(id),
      });
    }

    const routes = await this.routeRepository.find({
      where: { collectionId: id },
    });

    if (routes.length) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionNotEmpty,
      });
    }

    await this.collectionRepository.softDelete({
      id,
    });

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.deletedCollection,
    );
  }

  async viewAPIs(
    collectionId: string,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(collectionId),
      });
    }

    const [routes, totalNumberOfRecords] =
      await this.routeRepository.findAndCount({
        where: { collectionId, ...filters },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
      });

    const [gatewayServices, gatewayRoutes] = await Promise.all([
      this.kongService.listServices(KONG_ENVIRONMENT.DEVELOPMENT, {
        tags: collection.slug,
      }),
      this.kongRouteService.listRoutes(KONG_ENVIRONMENT.DEVELOPMENT, {
        tags: collection.slug,
      }),
    ]);

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedAPIs,
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
          route: new GETAPIRouteResponseDTO({
            paths: gatewayRoute?.paths || [],
            methods: gatewayRoute?.methods || [],
          }),
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

  async viewAPI(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id },
      relations: { collection: true },
    });

    if (!route) {
      throw new IBadRequestException({
        message: collectionErrorMessages.routeNotFound(id),
      });
    }

    let gatewayService = null;
    let gatewayRoutes = null;
    if (route.serviceId) {
      gatewayService = await this.kongService.getService(
        KONG_ENVIRONMENT.DEVELOPMENT,
        route.serviceId,
      );
      gatewayRoutes = await this.kongService.getServiceRoutes(
        KONG_ENVIRONMENT.DEVELOPMENT,
        route.serviceId,
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedAPI,
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

  async deleteAPI(id: string) {
    const route = await this.routeRepository.findOne({
      where: { id },
    });

    if (!route) {
      throw new IBadRequestException({
        message: collectionErrorMessages.routeNotFound(id),
      });
    }

    if (route.routeId) {
      await this.kongRouteService.deleteRoute(
        KONG_ENVIRONMENT.DEVELOPMENT,
        route.routeId,
      );
    }

    await this.routeRepository.softDelete({
      id,
    });

    // TODO emit event

    return ResponseFormatter.success(collectionsSuccessMessages.deletedAPI);
  }

  async createAPI(collectionId: string, data: UpdateAPIDto) {
    const { name, enabled, url } = data;
    const { paths, methods } = data.route;

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionNotFound(collectionId),
      });
    }

    const routeExists = await this.routeRepository.countBy({ name });
    if (routeExists) {
      throw new IBadRequestException({
        message: collectionErrorMessages.routeExists(name),
      });
    }

    const hostname = new URL(url).hostname;
    const gatewayService = await this.kongService.updateOrCreateService(
      KONG_ENVIRONMENT.DEVELOPMENT,
      {
        name: hostname,
        enabled: true,
        url,
        retries: 1,
        tags: [collection.slug!],
      },
    );

    const gatewayRoute = await this.kongRouteService.createRoute(
      KONG_ENVIRONMENT.DEVELOPMENT,
      {
        name: slugify(name, { lower: true, strict: true }),
        tags: [collection.slug!],
        paths,
        methods,
        service: {
          id: gatewayService.id,
        },
      },
    );

    const createdRoute = await this.routeRepository.save(
      this.routeRepository.create({
        name,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId,
        enabled,
      }),
    );

    if (enabled === true) {
      await this.kongRouteService.updateOrCreatePlugin(
        KONG_ENVIRONMENT.DEVELOPMENT,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: false,
        },
      );
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(
        KONG_ENVIRONMENT.DEVELOPMENT,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: true,
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.createdAPI,
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

  async updateAPI(routeId: string, data: UpdateAPIDto) {
    const { name, enabled, url } = data;
    const { paths, methods } = data.route;

    const route = await this.routeRepository.findOne({
      where: { id: routeId },
      relations: { collection: true },
    });

    if (!route) {
      throw new IBadRequestException({
        message: collectionErrorMessages.routeNotFound(routeId),
      });
    }

    const routeExists = await this.routeRepository.countBy({
      id: Not(routeId),
      name,
    });
    if (routeExists) {
      throw new IBadRequestException({
        message: collectionErrorMessages.routeExists(name),
      });
    }

    const hostname = new URL(url).hostname;
    const gatewayService = await this.kongService.updateOrCreateService(
      KONG_ENVIRONMENT.DEVELOPMENT,
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
        KONG_ENVIRONMENT.DEVELOPMENT,
        route.routeId,
        {
          name: slugify(name, { lower: true, strict: true }),
          paths,
          methods,
        },
      );
    } else {
      gatewayRoute = await this.kongRouteService.createRoute(
        KONG_ENVIRONMENT.DEVELOPMENT,
        {
          name: slugify(name, { lower: true, strict: true }),
          tags: [route.collection.slug!],
          paths,
          methods,
          service: {
            id: gatewayService.id,
          },
        },
      );
    }

    await this.routeRepository.update(
      { id: route.id },
      {
        name,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        enabled,
      },
    );

    if (enabled === true) {
      await this.kongRouteService.updateOrCreatePlugin(
        KONG_ENVIRONMENT.DEVELOPMENT,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: false,
        },
      );
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(
        KONG_ENVIRONMENT.DEVELOPMENT,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TERMINATION,
          enabled: true,
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.updatedAPI,
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
