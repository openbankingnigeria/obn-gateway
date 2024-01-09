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
import { In, Not, Repository } from 'typeorm';
import {
  APILogResponseDTO,
  AssignAPIsDto,
  APILogStatsResponseDTO,
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
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RequestContextService } from '@common/utils/request/request-context.service';
import { v4 as uuidV4 } from 'uuid';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { Company } from '@common/database/entities';
import { companyErrors } from '@company/company.errors';
import { ConsumerAcl } from '@common/database/entities/consumeracl.entity';
import { CompanyTypes } from '@common/database/constants';

// TODO return DTO based on parent type, i.e. we dont want to return sensitive API info data to API consumer for e.g.
@Injectable()
export class APIService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CollectionRoute)
    private readonly routeRepository: Repository<CollectionRoute>,
    @InjectRepository(ConsumerAcl)
    private readonly consumerAclRepository: Repository<ConsumerAcl>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
    private readonly kongConsumerService: KongConsumerService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly requestContext: RequestContextService,
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

    // Create an upstream service on the API gateway
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

    // Create a route on the API gateway which proxies to the upstream service
    const gatewayRoute = await this.kongRouteService.createRoute(environment, {
      name: slugify(name, { lower: true, strict: true }),
      tags: [collection.slug!],
      paths,
      methods,
      service: {
        id: gatewayService.id,
      },
    });

    const aclAllowedGroupName = uuidV4();

    let apiProviderConsumerId = this.requestContext.user!.company.consumerId;

    // If the api provider does not already have an associated consumer on the API gateway, create a new consumer for the API provider
    if (!apiProviderConsumerId) {
      // Update API provider consumer to allow access to route
      const response = await this.kongConsumerService.updateOrCreateConsumer(
        environment,
        {
          custom_id: this.requestContext.user!.company.id,
        },
      );

      apiProviderConsumerId = response.id;

      await this.companyRepository.update(
        {
          id: this.requestContext.user!.company.id,
        },
        { consumerId: apiProviderConsumerId },
      );
    }

    // Update API provider consumer to allow access to this new route
    await this.kongConsumerService.updateConsumerAcl(environment, {
      aclAllowedGroupName,
      consumerId: apiProviderConsumerId,
    });

    const createdRoute = await this.routeRepository.save(
      this.routeRepository.create({
        name,
        environment,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId: data.collectionId,
        enabled,
        aclAllowedGroupName,
      }),
    );

    await this.kongRouteService.updateOrCreatePlugin(
      environment,
      gatewayRoute.id,
      {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled,
      },
    );

    // Create an ACL on the route created and assign it an ACL group name
    // TODO move to an event listener
    await this.kongRouteService.updateOrCreatePlugin(
      environment,
      gatewayRoute.id,
      {
        config: {
          allow: [aclAllowedGroupName],
          hide_groups_header: true,
        },
        name: KONG_PLUGINS.ACL,
        enabled: true,
      },
    );

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
        aclAllowedGroupName,
      }),
    );
  }

  async assignAPIs(
    environment: KONG_ENVIRONMENT,
    companyId: string,
    { apiIds }: AssignAPIsDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: companyId,
      },
      relations: {
        acls: true,
      },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    let consumerId = company.consumerId;

    // If the API consumer does not already have an associated consumer on the API gateway, create a new consumer for the API consumer
    if (!consumerId) {
      // Update API provider consumer to allow access to route
      const response = await this.kongConsumerService.updateOrCreateConsumer(
        environment,
        {
          custom_id: this.requestContext.user!.company.id,
        },
      );

      consumerId = response.id;

      await this.companyRepository.update(
        {
          id: this.requestContext.user!.company.id,
        },
        { consumerId },
      );
    }

    const routes = await this.routeRepository.find({
      where: {
        id: In(
          apiIds.filter(
            (apiId) => !company.acls.some((acl) => acl.routeId === apiId),
          ), // Where the API Ids are not already part of the allowed APIs for this company
        ),
      },
    });

    const promises: Promise<{ aclId: string; routeId: string }>[] = [];

    routes.forEach(({ aclAllowedGroupName, id }) => {
      promises.push(
        new Promise(async (res) => {
          const response = await this.kongConsumerService.updateConsumerAcl(
            environment,
            {
              aclAllowedGroupName,
              consumerId: consumerId!,
            },
          );

          res({ aclId: response.id, routeId: id });
        }),
      );
    });

    // TODO Handle failures
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled') {
        await this.consumerAclRepository.save({
          aclId: result.value.aclId,
          companyId,
          routeId: result.value.routeId,
        });
      }
    }

    return ResponseFormatter.success(apiSuccessMessages.assignAPIs);
  }

  async unassignAPIs(
    environment: KONG_ENVIRONMENT,
    companyId: string,
    { apiIds }: AssignAPIsDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: {
        id: companyId,
      },
      relations: {
        acls: {
          route: true,
        },
      },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    const consumerId = company.consumerId!;

    const promises: Promise<void>[] = [];

    company.acls.forEach((acl) => {
      if (apiIds.includes(acl.routeId)) {
        promises.push(
          new Promise(async (res) => {
            await this.kongConsumerService.deleteConsumerAcl(environment, {
              aclId: acl.aclId,
              consumerId,
            });

            await this.consumerAclRepository.delete({
              id: acl.id,
            });

            res();
          }),
        );
      }
    });

    // TODO Handle failures
    await Promise.allSettled(promises);

    return ResponseFormatter.success(apiSuccessMessages.assignAPIs);
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

  // TODO ensure only AP can view logs for all users;
  async getAPILogs(
    environment: KONG_ENVIRONMENT,
    { limit, page }: PaginationParameters,
  ) {
    console.log({
      from: page - 1,
      size: limit,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  this.requestContext.user!.company.type ===
                  CompanyTypes.API_PROVIDER
                    ? '*'
                    : this.requestContext.user!.companyId,
              },
            },
          ],
        },
      },
      sort: [{ '@timestamp': { order: 'desc' } }],
    });
    const logs = await this.elasticsearchService.search({
      from: page - 1,
      size: limit,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  this.requestContext.user!.company.type ===
                  CompanyTypes.API_PROVIDER
                    ? '*'
                    : this.requestContext.user!.companyId,
              },
            },
          ],
        },
      },
      sort: [{ '@timestamp': { order: 'desc' } }],
    });

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogs,
      logs.hits.hits.map((i) => new APILogResponseDTO(i._source)),
    );
  }

  // TODO ensure only AP can view logs for all users;
  async getAPILog(environment: KONG_ENVIRONMENT, requestId: string) {
    const logs = await this.elasticsearchService.search({
      size: 1,
      query: {
        bool: {
          must: [
            {
              term: { 'request.headers.request-id.keyword': requestId },
            },
            {
              term: { 'environment.keyword': environment },
            },
            {
              wildcard: {
                'consumer.id.keyword':
                  this.requestContext.user!.company.type ===
                  CompanyTypes.API_PROVIDER
                    ? '*'
                    : this.requestContext.user!.companyId,
              },
            },
          ],
        },
      },
    });

    if (!logs.hits.hits.length) {
      throw new IBadRequestException({
        message: apiErrorMessages.logNotFound(requestId),
      });
    }

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogs,
      new APILogResponseDTO(logs.hits.hits[0]._source),
    );
  }

  // TODO ensure only AP can view logs for all users;
  async getAPILogsStats(environment: KONG_ENVIRONMENT) {
    const stats = await this.elasticsearchService.search({
      size: 0,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  this.requestContext.user!.companyId || '*',
              },
            },
          ],
        },
      },
      aggs: {
        avgRequestLatency: {
          avg: {
            field: 'latencies.request',
          },
        },
        avgGatewayLatency: {
          avg: {
            field: 'latencies.kong',
          },
        },
        avgProxyLatency: {
          avg: {
            field: 'latencies.proxy',
          },
        },
        totalCount: { value_count: { field: 'environment.keyword' } },
      },
    });

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogs,
      new APILogStatsResponseDTO(stats.aggregations),
    );
  }
}
