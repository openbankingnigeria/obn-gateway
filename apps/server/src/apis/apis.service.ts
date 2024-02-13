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
import { In, Not, Repository } from 'typeorm';
import {
  APILogResponseDTO,
  APILogStatsResponseDTO,
  CreateAPIDto,
  GetAPIResponseDTO,
  UpdateAPIDto,
  GetAPILogsDto,
  GetAPILogsFilterDto,
  GETAPIDownstreamResponseDTO,
  GETAPIUpstreamResponseDTO,
  GetStatsAggregateResponseDTO,
  SetAPITransformationDTO,
  GetAPITransformationResponseDTO,
  UpdateCompanyAPIAccessDto,
} from './dto/index.dto';
import slugify from 'slugify';
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { apiErrorMessages, apiSuccessMessages } from './apis.constants';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { v4 as uuidV4 } from 'uuid';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { Company, User } from '@common/database/entities';
import { companyErrors } from '@company/company.errors';
import { ConsumerAcl } from '@common/database/entities/consumeracl.entity';
import { CompanyTypes } from '@common/database/constants';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { RequestContext } from '@common/utils/request/request-context';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';

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
    // TODO make private
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
    private readonly kongConsumerService: KongConsumerService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly config: ConfigService,
  ) {}

  async viewAPIs(
    ctx: RequestContext,
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
        tags: Array.from(new Set(routes.map((route) => route.collection.slug!)))
          .slice(0, 5)
          .join('/'),
      }),
      this.kongRouteService.listRoutes(environment, {
        tags: Array.from(new Set(routes.map((route) => route.collection.slug!)))
          .slice(0, 5)
          .join('/'),
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
        return new GetAPIResponseDTO(
          {
            id: route.id,
            name: route.name,
            enabled: route.enabled,
            collectionId: route.collectionId,
            upstream: new GETAPIUpstreamResponseDTO(
              {
                url: gatewayService
                  ? `${gatewayService.protocol}://${gatewayService.host}:${
                      gatewayService.port || ''
                    }${gatewayService.path || ''}`
                  : null,
              },
              ctx,
            ),
            downstream: new GETAPIDownstreamResponseDTO(
              {
                path: gatewayRoute?.paths[0] ?? null,
                method: gatewayRoute?.methods[0] ?? null,
                url: route.url,
              },
              ctx,
            ),
          },
          ctx,
        );
      }),
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async viewAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    idOrSlug: string,
  ) {
    const route = await this.routeRepository.findOne({
      where: [
        { id: idOrSlug, environment },
        { name: idOrSlug, environment },
      ],
      relations: { collection: true },
    });

    if (!route) {
      throw new INotFoundException({
        message: apiErrorMessages.routeNotFound(idOrSlug),
      });
    }

    let gatewayService = null;
    let gatewayRoute = null;
    let plugin = null;
    if (route.serviceId) {
      gatewayService = await this.kongService.getService(
        environment,
        route.serviceId,
      );
    }
    if (route.routeId) {
      gatewayRoute = await this.kongRouteService.getRoute(
        environment,
        route.routeId,
      );
    }
    if (gatewayRoute?.id) {
      const plugins = await this.kongRouteService.getPlugins(
        environment,
        gatewayRoute?.id,
      );

      plugin = plugins.data.find(
        (plugin) => plugin.name === KONG_PLUGINS.REQUEST_TRANSFORMER,
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPI,
      new GetAPIResponseDTO(
        {
          id: route.id,
          name: route.name,
          enabled: route.enabled,
          collectionId: route.collectionId,
          upstream: new GETAPIUpstreamResponseDTO(
            {
              url: gatewayService
                ? `${gatewayService.protocol}://${gatewayService.host}:${
                    gatewayService.port || ''
                  }${gatewayService.path || ''}`
                : null,
              method: plugin?.config.http_method || null,
              headers:
                plugin?.config?.add?.headers?.map((header: string) => {
                  const [key, ...value] = header.split(':');
                  return { key, value: value.join(':') };
                }) || [],
              querystring:
                plugin?.config?.add?.querystring?.map((header: string) => {
                  const [key, ...value] = header.split(':');
                  return { key, value: value.join(':') };
                }) || [],
              body:
                plugin?.config?.add?.body?.map((header: string) => {
                  const [key, ...value] = header.split(':');
                  return { key, value: value.join(':') };
                }) || [],
            },
            ctx,
          ),
          downstream: new GETAPIDownstreamResponseDTO(
            {
              path: gatewayRoute?.paths[0] ?? null,
              method: gatewayRoute?.methods[0] ?? null,
              url: route.url,
            },
            ctx,
          ),
        },
        ctx,
      ),
    );
  }

  async deleteAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    id: string,
  ) {
    const route = await this.routeRepository.findOne({
      where: { id, environment },
    });

    if (!route) {
      throw new INotFoundException({
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

  private async updateConsumerId(
    companyId: string,
    environment: KONG_ENVIRONMENT,
  ) {
    // Update API provider consumer to allow access to route
    const response = await this.kongConsumerService.updateOrCreateConsumer(
      environment,
      {
        custom_id: companyId,
      },
    );

    await this.companyRepository.update(
      {
        id: companyId,
      },
      { consumerId: response.id },
    );

    return response.id;
  }

  async createAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    data: CreateAPIDto,
  ) {
    const { name, enabled, downstream, upstream } = data;

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

    const { hostname, pathname } = new URL(upstream.url);

    // Create an upstream service on the API gateway
    const gatewayService = await this.kongService.updateOrCreateService(
      environment,
      {
        name: slugify(hostname + '-' + pathname, { strict: true }),
        enabled: true,
        url: upstream.url,
        retries: 1,
        tags: [collection.slug!],
      },
    );

    // Create a route on the API gateway which proxies to the upstream service
    const gatewayRoute = await this.kongRouteService.createRoute(environment, {
      name: slugify(name, { lower: true, strict: true }),
      tags: [collection.slug!],
      paths: [downstream.path],
      methods: [downstream.method],
      service: {
        id: gatewayService.id,
      },
    });

    const aclAllowedGroupName = uuidV4();

    // If the api provider does not already have an associated consumer on the API gateway, create a new consumer for the API provider
    const apiProviderConsumerId =
      ctx.activeCompany.consumerId ||
      (await this.updateConsumerId(ctx.activeCompany.id!, environment));

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

    // Update API provider consumer to allow access to this new route
    await this.kongConsumerService.updateConsumerAcl(environment, {
      aclAllowedGroupName,
      consumerId: apiProviderConsumerId,
    });

    let cleanPath = data.downstream.path.replace(/\([^)]*\)\$/, '');
    if (cleanPath.startsWith('~')) cleanPath = cleanPath.slice(1);
    if (cleanPath.endsWith('$')) {
      cleanPath = cleanPath.slice(0, cleanPath.length - 1);
    }

    const createdRoute = await this.routeRepository.save(
      this.routeRepository.create({
        name,
        environment,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId: data.collectionId,
        enabled,
        aclAllowedGroupName,
        url:
          data.downstream.url ??
          `${this.config.get('kong.gatewayEndpoint')[environment]}${cleanPath}`,
      }),
    );

    await this.kongRouteService.updateOrCreatePlugin(
      environment,
      gatewayRoute.id,
      {
        name: KONG_PLUGINS.REQUEST_TERMINATION,
        enabled: !enabled,
      },
    );

    if (
      upstream.headers ||
      upstream.querystring ||
      upstream.body ||
      upstream.method
    ) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TRANSFORMER,
          enabled: true,
          config: {
            http_method: upstream.method?.toUpperCase(),
            remove: {
              headers: upstream.headers?.map((h) => `${h.key}:${h.value}`),
              querystring: upstream.querystring?.map(
                (h) => `${h.key}:${h.value}`,
              ),
              body: upstream.body?.map((h) => `${h.key}:${h.value}`),
            },
            add: {
              headers: upstream.headers?.map((h) => `${h.key}:${h.value}`),
              querystring: upstream.querystring?.map(
                (h) => `${h.key}:${h.value}`,
              ),
              body: upstream.body?.map((h) => `${h.key}:${h.value}`),
            },
          },
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.createdAPI,
      new GetAPIResponseDTO(
        {
          id: createdRoute.id,
          name: createdRoute.name,
          enabled: createdRoute.enabled,
          collectionId: createdRoute.collectionId,
          upstream: new GETAPIUpstreamResponseDTO(
            {
              ...data.upstream,
              url: `${gatewayService.protocol}://${gatewayService.host}:${
                gatewayService.port || ''
              }${gatewayService.path || ''}`,
            },
            ctx,
          ),
          downstream: new GETAPIDownstreamResponseDTO(data.downstream, ctx),
        },
        ctx,
      ),
    );
  }

  async assignAPIs(
    apiIds: string[],
    company: Company,
    environment: KONG_ENVIRONMENT,
  ) {
    const consumerId =
      company.consumerId ||
      (await this.updateConsumerId(company.id!, environment));

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
        new Promise(async (res, rej) => {
          try {
            const response = await this.kongConsumerService.updateConsumerAcl(
              environment,
              {
                aclAllowedGroupName,
                consumerId: consumerId!,
              },
            );

            res({ aclId: response.id, routeId: id });
          } catch (err) {
            rej(err);
          }
        }),
      );
    });

    // TODO Handle failures
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'rejected') {
        console.log({ result });
      }
    }

    for (const result of results) {
      if (result.status === 'fulfilled') {
        await this.consumerAclRepository.save({
          aclId: result.value.aclId,
          companyId: company.id,
          routeId: result.value.routeId,
        });
      }
    }

    return { success: true };
  }

  async unassignAPIs(
    apiIds: string[],
    company: Company,
    environment: KONG_ENVIRONMENT,
  ) {
    const consumerId = company.consumerId!;

    const promises: Promise<void>[] = [];

    company.acls.forEach((acl) => {
      if (apiIds.includes(acl.routeId)) {
        promises.push(
          new Promise(async (res, rej) => {
            try {
              await this.kongConsumerService.deleteConsumerAcl(environment, {
                aclId: acl.aclId,
                consumerId,
              });

              await this.consumerAclRepository.delete({
                id: acl.id,
              });

              res();
            } catch (err) {
              rej(err);
            }
          }),
        );
      }
    });

    // TODO Handle failures
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'rejected') {
        console.log({ result });
      }
    }

    return { success: true };
  }

  async updateCompanyApiAccess(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    companyId: string,
    { apiIds }: UpdateCompanyAPIAccessDto,
  ) {
    const company = await this.companyRepository.findOne({
      where: { id: companyId },
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

    // Routes to assign are present in apiIds array but not in previosAllowedRoutes array
    // Routes to unassign are present in previosAllowedRoutes array but not in apiIds array
    const previousAllowedRoutesIds = company.acls.map((acl) => acl.route.id);

    const routesToUnassign = previousAllowedRoutesIds.filter(
      (routeId) => !apiIds.includes(routeId),
    );

    const routesToAssign = apiIds.filter(
      (newRouteId) => !previousAllowedRoutesIds.includes(newRouteId),
    );

    await Promise.allSettled([
      await this.assignAPIs(routesToAssign, company, environment),
      await this.unassignAPIs(routesToUnassign, company, environment),
    ]);

    return ResponseFormatter.success(apiSuccessMessages.updatedAPIAccess);
  }

  async updateAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    routeId: string,
    data: UpdateAPIDto,
  ) {
    const { name, enabled, downstream, upstream } = data;

    const route = await this.routeRepository.findOne({
      where: { id: routeId, environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new INotFoundException({
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

    const { hostname, pathname } = new URL(upstream.url);
    const gatewayService = await this.kongService.updateOrCreateService(
      environment,
      {
        name: slugify(hostname + '-' + pathname, { strict: true }),
        enabled: true,
        url: upstream.url,
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
          paths: [downstream.path],
          methods: [downstream.method],
          service: {
            id: gatewayService.id,
          },
        },
      );
    } else {
      gatewayRoute = await this.kongRouteService.createRoute(environment, {
        name: slugify(name, { lower: true, strict: true }),
        tags: [route.collection.slug!],
        paths: [downstream.path],
        methods: [downstream.method],
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
        url: data.downstream.url,
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

    if (
      upstream.method ||
      upstream.headers ||
      upstream.querystring ||
      upstream.body
    ) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.REQUEST_TRANSFORMER,
          enabled: true,
          config: {
            http_method: upstream.method?.toUpperCase(),
            remove: {
              headers: upstream.headers?.map((h) => `${h.key}:${h.value}`),
              querystring: upstream.querystring?.map(
                (h) => `${h.key}:${h.value}`,
              ),
              body: upstream.body?.map((h) => `${h.key}:${h.value}`),
            },
            add: {
              headers: upstream.headers?.map((h) => `${h.key}:${h.value}`),
              querystring: upstream.querystring?.map(
                (h) => `${h.key}:${h.value}`,
              ),
              body: upstream.body?.map((h) => `${h.key}:${h.value}`),
            },
          },
        },
      );
    }

    // TODO emit event

    return ResponseFormatter.success(
      apiSuccessMessages.updatedAPI,
      new GetAPIResponseDTO(
        {
          id: route.id,
          name: route.name,
          enabled: route.enabled,
          collectionId: route.collectionId,
          upstream: new GETAPIUpstreamResponseDTO(
            {
              ...data.upstream,
              url: `${gatewayService.protocol}://${gatewayService.host}:${
                gatewayService.port || ''
              }${gatewayService.path || ''}`,
            },
            ctx,
          ),
          downstream: new GETAPIDownstreamResponseDTO(data.downstream, ctx),
        },
        ctx,
      ),
    );
  }

  private async convertFilterToSearchDSLQuery<T = any>(
    filters?: T,
  ): Promise<QueryDslQueryContainer[]> {
    const result: QueryDslQueryContainer[] = [];
    for (const index in filters) {
      let filter: string = index;
      let item = filters[index] as any;
      if (!item) continue;
      if (filter === 'route.id') {
        const apis = await this.routeRepository.find({
          select: ['routeId'],
          where: { id: In(Array.isArray(item) ? item : [item]) },
        });
        item = apis.map((i) => i.routeId);
      }
      if (filter === 'collectionId') {
        filter = 'route.id';
        const apis = await this.routeRepository.find({
          select: ['routeId'],
          where: { collectionId: In(Array.isArray(item) ? item : [item]) },
        });
        item = apis.map((i) => i.routeId);
      }
      if (item.gt || item.lt) {
        result.push({
          range: { [`${filter}`]: { lt: item.lt, gt: item.gt } },
        });
      } else if (typeof item === 'string') {
        result.push({
          term: { [`${filter}.keyword`]: item },
        });
      } else if (typeof item === 'number') {
        result.push({
          term: { [`${filter}`]: item },
        });
      } else if (Array.isArray(item)) {
        result.push({
          terms: {
            [item.every((i) => typeof i === 'number')
              ? filter
              : `${filter}.keyword`]: item,
          },
        });
      }
    }
    return result;
  }

  async getAPILogs(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    { limit, page }: PaginationParameters,
    filters?: GetAPILogsDto,
  ) {
    const logs = await this.elasticsearchService.search<any>({
      from: page - 1,
      size: limit,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  ctx.activeCompany.type === CompanyTypes.API_PROVIDER
                    ? '*'
                    : ctx.activeUser.companyId,
              },
            },
            ...(await this.convertFilterToSearchDSLQuery<GetAPILogsFilterDto>(
              filters?.filter,
            )),
          ],
        },
      },
      sort: [{ '@timestamp': { order: 'desc' } }],
    });

    const companies = await this.companyRepository.find({
      where: {
        consumerId: In(
          Array.from(
            new Set(logs.hits.hits.map((hit) => hit._source.consumer?.id)),
          ),
        ),
      },
    });

    const companiesDtoStore = companies.reduce<{ [k: string]: Company }>(
      (acc, curr) => {
        acc[curr.id!] = curr;
        return acc;
      },
      {},
    );

    for (const hit of logs.hits.hits) {
      hit._source.consumer = companiesDtoStore[hit._source.consumer?.id];
    }

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogs,
      logs.hits.hits.map((i) => new APILogResponseDTO(i._source, ctx)),
    );
  }

  async getAPILog(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    requestId: string,
  ) {
    const logs = await this.elasticsearchService.search<any>({
      size: 1,
      query: {
        bool: {
          must: [
            {
              term: { 'response.headers.x-request-id.keyword': requestId },
            },
            {
              term: { 'environment.keyword': environment },
            },
            {
              wildcard: {
                'consumer.id.keyword':
                  ctx.activeCompany.type === CompanyTypes.API_PROVIDER
                    ? '*'
                    : ctx.activeUser.companyId,
              },
            },
          ],
        },
      },
    });

    if (!logs.hits.hits.length) {
      throw new INotFoundException({
        message: apiErrorMessages.logNotFound(requestId),
      });
    }

    let company = null;
    if (logs.hits.hits[0]._source.consumer?.id) {
      company = await this.companyRepository.findOne({
        where: {
          consumerId: logs.hits.hits[0]._source.consumer?.id,
        },
      });
    }

    logs.hits.hits[0]._source.consumer = company;

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILog,
      new APILogResponseDTO(logs.hits.hits[0]._source, ctx),
    );
  }

  async getAPILogsStats(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    filters?: GetAPILogsDto,
  ) {
    const stats = await this.elasticsearchService.search({
      size: 0,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  ctx.activeCompany.type === CompanyTypes.API_PROVIDER
                    ? '*'
                    : ctx.activeUser.companyId,
              },
            },
            ...(await this.convertFilterToSearchDSLQuery<GetAPILogsFilterDto>(
              filters?.filter,
            )),
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
        successCount: {
          filter: {
            range: {
              'response.status': { lt: 400 },
            },
          },
        },
        failedCount: {
          filter: {
            range: {
              'response.status': { gte: 400 },
            },
          },
        },
        totalCount: { value_count: { field: 'environment.keyword' } },
        countPerSecond: {
          date_histogram: {
            field: '@timestamp',
            fixed_interval: '1s',
            min_doc_count: 1,
          },
          aggs: {
            totalCount: { value_count: { field: 'environment.keyword' } },
          },
        },
        avgCountPerSecond: {
          avg_bucket: {
            buckets_path: 'countPerSecond>totalCount',
          },
        },
      },
    });

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogsStats,
      new APILogStatsResponseDTO(stats.aggregations, ctx),
    );
  }

  async getAPILogsStatsAggregate(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    query: GetAPILogsDto,
  ) {
    const stats = await this.elasticsearchService.search<any, any>({
      size: 0,
      query: {
        bool: {
          must: [
            { term: { 'environment.keyword': environment } },
            {
              wildcard: {
                'consumer.id.keyword':
                  ctx.activeCompany.type === CompanyTypes.API_PROVIDER
                    ? '*'
                    : ctx.activeUser.companyId,
              },
            },
            ...(await this.convertFilterToSearchDSLQuery<GetAPILogsFilterDto>(
              query?.filter,
            )),
          ],
        },
      },
      aggs: {
        aggregated: {
          date_histogram: {
            field: '@timestamp',
            calendar_interval: 'day',
            min_doc_count: 0,
            extended_bounds: {
              min: query.filter?.['@timestamp'].gt
                ? moment(query.filter['@timestamp'].gt).format('YYYY-MM-DD')
                : moment(query.filter?.['@timestamp'].lt)
                    .subtract(30, 'days')
                    .format('YYYY-MM-DD'),
              max: moment(query.filter?.['@timestamp'].lt).format('YYYY-MM-DD'),
            },
          },
        },
      },
    });
    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPILogsStats,
      stats.aggregations!['aggregated'].buckets.map(
        (bucket: any) => new GetStatsAggregateResponseDTO(bucket, ctx),
      ),
    );
  }

  async getApisAssignedToCompany(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    companyId?: string,
  ) {
    const company = await this.companyRepository.findOne({
      // TODO
      where: { id: companyId ?? ctx.activeCompany.id },
      relations: {
        acls: {
          route: true,
        },
      },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(
          companyId ?? ctx.activeCompany.id,
        ),
      });
    }

    const acls = company.acls.map((acl) => ({
      id: acl.id,
      route: acl.route,
    }));

    const routes = acls.map(({ route }) => {
      return route;
    });

    const populatedRoutes: any[] = [];

    for (const route of routes) {
      let gatewayService = null;
      let gatewayRoute = null;
      if (route.serviceId) {
        gatewayService = await this.kongService.getService(
          environment,
          route.serviceId,
        );
      }
      if (route.routeId) {
        gatewayRoute = await this.kongRouteService.getRoute(
          environment,
          route.routeId,
        );
      }

      populatedRoutes.push(
        new GetAPIResponseDTO(
          {
            id: route.id,
            name: route.name,
            enabled: route.enabled,
            collectionId: route.collectionId,
            upstream: new GETAPIUpstreamResponseDTO(
              {
                url: gatewayService
                  ? `${gatewayService.protocol}://${gatewayService.host}:${
                      gatewayService.port || ''
                    }${gatewayService.path || ''}`
                  : null,
              },
              ctx,
            ),
            downstream: new GETAPIDownstreamResponseDTO(
              {
                path: gatewayRoute?.paths[0] ?? null,
                method: gatewayRoute?.methods[0] ?? null,
                url: route.url,
              },
              ctx,
            ),
          },
          ctx,
        ),
      );
    }

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPIs,
      populatedRoutes,
    );
  }

  async getTransformation(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    routeId: string,
  ) {
    const route = await this.routeRepository.findOne({
      where: { id: routeId, environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new INotFoundException({
        message: apiErrorMessages.routeNotFound(routeId),
      });
    }

    // TODO emit event

    const plugins = await this.kongRouteService.getPlugins(
      environment,
      route.routeId!,
    );

    const plugin = plugins.data.find(
      (plugin) => plugin.name === KONG_PLUGINS.PRE_FUNCTION,
    );

    if (!plugin) {
      throw new INotFoundException({
        message: apiErrorMessages.functionNotFound(routeId),
      });
    }

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPITransformation,
      new GetAPITransformationResponseDTO(plugin.config, ctx),
    );
  }

  async setTransformation(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    routeId: string,
    data: SetAPITransformationDTO,
  ) {
    const route = await this.routeRepository.findOne({
      where: { id: routeId, environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new INotFoundException({
        message: apiErrorMessages.routeNotFound(routeId),
      });
    }

    // TODO emit event

    const plugin = await this.kongRouteService.updateOrCreatePlugin(
      environment,
      route.routeId!,
      {
        config: {
          access: [data.upstream],
          body_filter: [data.downstream],
          // this is required to ensure that we dont send an invalid content length to the downstream/client
          header_filter: ['kong.response.clear_header("Content-Length")'],
        },
        name: KONG_PLUGINS.PRE_FUNCTION,
        enabled: true,
      },
    );

    return ResponseFormatter.success(
      apiSuccessMessages.updatedAPI,
      new GetAPITransformationResponseDTO(plugin.config, ctx),
    );
  }
}
