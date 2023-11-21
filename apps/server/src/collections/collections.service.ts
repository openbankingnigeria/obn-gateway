import { Collection } from '@common/database/entities/collection.entity';
import { ResponseFormatter } from '@common/utils/common/response.util';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { KongRouteService } from '@shared/integrations/kong/route.kong.service';
import { KongServiceService } from '@shared/integrations/kong/service.kong.service';
import { Repository } from 'typeorm';
import {
  CreateCollectionDto,
  UpdateAPIDto,
  UpdateCollectionDto,
} from './dto/index.dto';
import slugify from 'slugify';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
  ) {}

  async listCollections() {
    const collections = await this.collectionRepository.find({});
    return ResponseFormatter.success('', collections);
  }

  async viewCollection(id: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });
    return ResponseFormatter.success('', collection);
  }

  async createCollection(data: CreateCollectionDto) {
    const collectionExists = await this.collectionRepository.count({
      where: {
        name: data.name,
      },
    });

    if (collectionExists) {
      throw new IBadRequestException({
        message: '',
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

    return ResponseFormatter.success('', collection);
  }

  async updateCollection(id: string, data: UpdateCollectionDto) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: '',
      });
    }

    const { description } = data;

    await this.collectionRepository.update(
      { id: collection.id },
      this.collectionRepository.create({
        description,
      }),
    );

    return ResponseFormatter.success('', collection);
  }

  async viewAPIs(collectionId: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });
    if (!collection) {
      throw new INotFoundException({
        message: '',
      });
    }

    const [apis, routes] = await Promise.all([
      this.kongService.listServices({ tags: collection.slug }),
      this.kongRouteService.listRoutes({ tags: collection.slug }),
    ]);

    return ResponseFormatter.success(
      '',
      apis.data.map((api) => {
        const route = routes.data.find((route) => route.service.id === api.id)!;
        return {
          id: api.id,
          name: api.name,
          enabled: api.enabled,
          host: api.host,
          protocol: api.protocol,
          port: api.port,
          path: api.path,
          url: `${api.protocol}://${api.host}:${api.port}${api.path}`,
          route: {
            paths: route?.paths || [],
            methods: route?.methods || [],
          },
        };
      }),
    );
  }

  async viewAPI(id: string) {
    const api = await this.kongService.getService(id);
    const routes = await this.kongService.getServiceRoutes(id);
    return ResponseFormatter.success('', {
      id: api.id,
      name: api.name,
      enabled: api.enabled,
      host: api.host,
      protocol: api.protocol,
      port: api.port,
      path: api.path,
      url: `${api.protocol}://${api.host}:${api.port}${api.path}`,
      route: {
        paths: routes.data[0]?.paths || [],
        methods: routes.data[0]?.methods || [],
      },
    });
  }

  async createAPI(collectionId: string, data: UpdateAPIDto) {
    const { name, enabled, url, route } = data;

    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (!collection) {
      throw new IBadRequestException({
        message: '',
      });
    }

    const api = await this.kongService.createService({
      name: slugify(name, { lower: true, strict: true }),
      enabled,
      url,
      retries: 1,
      tags: [collection.slug!],
    });

    await this.kongRouteService.createRoute({
      name: slugify(name, { lower: true, strict: true }),
      tags: [collection.slug!],
      paths: route.paths,
      methods: route.methods,
      service: {
        id: api.id,
      },
    });

    return ResponseFormatter.success('', {
      id: api.id,
      name: api.name,
      enabled: api.enabled,
      host: api.host,
      protocol: api.protocol,
      port: api.port,
      path: api.path,
      url: `${api.protocol}://${api.host}:${api.port}${api.path}`,
      route,
    });
  }

  async updateAPI(id: string, data: UpdateAPIDto) {
    const { name, enabled, url, route } = data;

    const routes = await this.kongService.getServiceRoutes(id);

    const api = await this.kongService.updateService(id, {
      name: slugify(name, { lower: true, strict: true }),
      enabled,
      url,
    });
    await this.kongRouteService.updateRoute(routes.data[0].id, route);

    return ResponseFormatter.success('', {
      id: api.id,
      name: api.name,
      enabled: api.enabled,
      host: api.host,
      protocol: api.protocol,
      port: api.port,
      path: api.path,
      url: `${api.protocol}://${api.host}:${api.port}${api.path}`,
      route,
    });
  }
}
