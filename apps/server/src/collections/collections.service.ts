import { Collection } from '@common/database/entities/collection.entity';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KongRouteService } from '@shared/integrations/kong/route.kong.service';
import { KongServiceService } from '@shared/integrations/kong/service.kong.service';
import { Not, Repository } from 'typeorm';
import {
  CreateCollectionDto,
  UpdateAPIDto,
  UpdateCollectionDto,
} from './dto/index.dto';
import slugify from 'slugify';
import {
  collectionErrorMessages,
  collectionsSuccessMessages,
} from './collections.constants';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { KONG_PLUGINS } from './types';

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

  async listCollections() {
    const collections = await this.collectionRepository.find({});
    // TODO emit event
    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollections,
      collections,
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
      collection,
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
      collection,
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
      collection,
    );
  }

  async viewAPIs(collectionId: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(collectionId),
      });
    }

    const routes = await this.routeRepository.find({
      where: { collectionId },
    });

    const [gatewayServices, gatewayRoutes] = await Promise.all([
      this.kongService.listServices({ tags: collection.slug }),
      this.kongRouteService.listRoutes({ tags: collection.slug }),
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
        return {
          id: route.id,
          name: route.name,
          enabled: route.enabled,
          host: gatewayService.host,
          protocol: gatewayService.protocol,
          port: gatewayService.port,
          path: gatewayService.path,
          url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
          route: {
            paths: gatewayRoute?.paths || [],
            methods: gatewayRoute?.methods || [],
          },
        };
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

    const gatewayService = await this.kongService.getService(route.serviceId);
    const gatewayRoutes = await this.kongService.getServiceRoutes(
      route.serviceId,
    );

    // TODO emit event

    return ResponseFormatter.success(collectionsSuccessMessages.fetchedAPI, {
      id: route.id,
      name: route.name,
      enabled: route.enabled,
      host: gatewayService.host,
      protocol: gatewayService.protocol,
      port: gatewayService.port,
      path: gatewayService.path,
      url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
      route: {
        paths: gatewayRoutes.data[0]?.paths || [],
        methods: gatewayRoutes.data[0]?.methods || [],
      },
    });
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
    const gatewayService = await this.kongService.updateOrCreateService({
      name: hostname,
      enabled: true,
      url,
      retries: 1,
      tags: [collection.slug!],
    });

    const gatewayRoute = await this.kongRouteService.createRoute({
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
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId,
        enabled,
      }),
    );

    if (enabled === true) {
      await this.kongRouteService.updateOrCreatePlugin(gatewayRoute.id, {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled: false,
      });
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(gatewayRoute.id, {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled: true,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(collectionsSuccessMessages.createdAPI, {
      id: createdRoute.id,
      name: createdRoute.name,
      enabled: createdRoute.enabled,
      host: gatewayService.host,
      protocol: gatewayService.protocol,
      port: gatewayService.port,
      path: gatewayService.path,
      url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
      route: data.route,
    });
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
    const gatewayService = await this.kongService.updateOrCreateService({
      name: hostname,
      enabled: true,
      url,
      retries: 1,
      tags: [route.collection.slug!],
    });

    const gatewayRoute = await this.kongRouteService.updateRoute(
      route.routeId,
      {
        name: slugify(name, { lower: true, strict: true }),
        paths,
        methods,
      },
    );

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
      await this.kongRouteService.updateOrCreatePlugin(gatewayRoute.id, {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled: false,
      });
    } else if (enabled === false) {
      await this.kongRouteService.updateOrCreatePlugin(gatewayRoute.id, {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled: true,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(collectionsSuccessMessages.updatedAPI, {
      id: route.id,
      name: route.name,
      enabled: route.enabled,
      host: gatewayService.host,
      protocol: gatewayService.protocol,
      port: gatewayService.port,
      path: gatewayService.path,
      url: `${gatewayService.protocol}://${gatewayService.host}:${gatewayService.port}${gatewayService.path}`,
      route: data.route,
    });
  }
}
