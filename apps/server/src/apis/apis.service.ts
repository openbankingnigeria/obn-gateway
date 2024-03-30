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
import { Equal, In, Like, Not, Repository } from 'typeorm';
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
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { apiErrorMessages, apiSuccessMessages } from './apis.constants';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { v4 as uuidV4 } from 'uuid';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import {
  Company,
  User,
  CollectionRoute,
  Collection,
} from '@common/database/entities';
import { companyErrors } from '@company/company.errors';
import { CompanyTypes } from '@common/database/constants';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { RequestContext } from '@common/utils/request/request-context';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { Acl } from '@shared/integrations/kong/consumer/consumer.kong.interface';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  AssignApiEvent,
  CreateApiEvent,
  DeleteApisEvent,
  GetApiLogEvent,
  GetApiLogStatsEvent,
  GetApiTransformationEvent,
  SetApiTransformationEvent,
  UnassignApiEvent,
  UpdateApiEvent,
  ViewApisEvent,
  ViewCompanyApisEvent,
} from '@shared/events/api.event';

@Injectable()
export class APIService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CollectionRoute)
    private readonly routeRepository: Repository<CollectionRoute>,
    // TODO make private
    @InjectRepository(User)
    readonly userRepository: Repository<User>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
    private readonly kongConsumerService: KongConsumerService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly config: ConfigService,
    private readonly eventEmitter: EventEmitter2,
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
        tags:
          Array.from(new Set(routes.map((route) => route.collection.slug!)))
            .slice(0, 5)
            .join('/') || undefined,
      }),
      this.kongRouteService.listRoutes(environment, {
        tags:
          Array.from(new Set(routes.map((route) => route.collection.slug!)))
            .slice(0, 5)
            .join('/') || undefined,
      }),
    ]);

    const event = new ViewApisEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
            slug: route.slug,
            introspectAuthorization: route.introspectAuthorization,
            enabled: route.enabled,
            collectionId: route.collectionId,
            tiers: route.tiers || [],
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
        { id: Equal(idOrSlug), environment },
        { name: Equal(idOrSlug), environment },
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

    const event = new ViewApisEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    // TODO optimize
    function objectToMap(obj: any) {
      if (!obj) return obj;
      const map = new Map();
      Object.entries(obj).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          map.set(
            key,
            value.map((item) =>
              typeof item === 'object' && item !== null
                ? objectToMap(item)
                : item,
            ),
          ); // Convert array elements to maps if they are objects
        } else if (typeof value === 'object' && value !== null) {
          map.set(key, objectToMap(value)); // Recursively convert nested object to Map
        } else {
          map.set(key, value);
        }
      });
      return map;
    }

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPI,
      new GetAPIResponseDTO(
        {
          id: route.id,
          name: route.name,
          slug: route.slug,
          introspectAuthorization: route.introspectAuthorization,
          enabled: route.enabled,
          collectionId: route.collectionId,
          tiers: route.tiers || [],
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
              request: objectToMap(route.request),
              response: route.response?.map((r) => objectToMap(r)),
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
      where: { id: Equal(id), environment },
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

    const event = new DeleteApisEvent(ctx.activeUser, { route });
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(apiSuccessMessages.deletedAPI);
  }

  private async updateConsumerId(
    company: Company,
    environment: KONG_ENVIRONMENT,
  ) {
    // Update API provider consumer to allow access to route
    const response = await this.kongConsumerService.updateOrCreateConsumer(
      environment,
      {
        custom_id: company.id,
      },
    );

    if (company.tier) {
      // TODO optimize
      await this.kongConsumerService
        .updateConsumerAcl(environment, {
          aclAllowedGroupName: `tier-${company.tier}`,
          consumerId: response.id,
        })
        .catch(console.error);
    }

    return response.id;
  }

  async createAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    data: CreateAPIDto,
  ) {
    const {
      name,
      enabled,
      downstream,
      upstream,
      tiers = [],
      slug = slugify(name, { strict: true, lower: true }),
      introspectAuthorization = false,
    } = data;

    const collection = await this.collectionRepository.findOne({
      where: { id: Equal(data.collectionId) },
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

    const routeId = uuidV4();

    // If the api provider does not already have an associated consumer on the API gateway, create a new consumer for the API provider
    const apiProviderConsumerId = await this.updateConsumerId(
      ctx.activeCompany,
      environment,
    );

    // Create an ACL on the route created and assign it an ACL group name
    if (tiers || environment !== KONG_ENVIRONMENT.DEVELOPMENT) {
      const allow = [
        environment !== KONG_ENVIRONMENT.DEVELOPMENT
          ? `route-${routeId}`
          : undefined,
        ...tiers.map((tier) => `tier-${tier}`),
      ].filter(Boolean);
      if (allow.length) {
        await this.kongRouteService.updateOrCreatePlugin(
          environment,
          gatewayRoute.id,
          {
            config: {
              allow,
              hide_groups_header: true,
            },
            name: KONG_PLUGINS.ACL,
            enabled: true,
          },
        );
        // Update API provider consumer to allow access to this new route
        await this.kongConsumerService.updateConsumerAcl(environment, {
          aclAllowedGroupName: `route-${routeId}`,
          consumerId: apiProviderConsumerId,
        });
      }
    }

    let cleanPath = data.downstream.path.replace(/\([^)]*\)\$/, '');
    if (cleanPath.startsWith('~')) cleanPath = cleanPath.slice(1);
    if (cleanPath.endsWith('$')) {
      cleanPath = cleanPath.slice(0, cleanPath.length - 1);
    }

    const createdRoute = await this.routeRepository.save(
      this.routeRepository.create({
        id: routeId,
        name,
        slug,
        environment,
        introspectAuthorization,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        collectionId: data.collectionId,
        enabled,
        url:
          data.downstream.url ??
          `${this.config.get('kong.gatewayEndpoint')[environment] || ''}${cleanPath}`,
        method: downstream.method,
        request: downstream.request,
        response: downstream.response,
        tiers,
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

    if (introspectAuthorization) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.OBN_AUTHORIZATION,
          enabled: true,
          config: {
            introspection_endpoint: this.config.get(
              'registry.introspectionEndpoint',
            )[environment],
            client_id: this.config.get('registry.introspectionClientID')[
              environment
            ],
            client_secret: this.config.get(
              'registry.introspectionClientSecret',
            )[environment],
            scope: [slug],
          },
        },
      );
    }

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

    const event = new CreateApiEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      apiSuccessMessages.createdAPI,
      new GetAPIResponseDTO(
        {
          id: createdRoute.id,
          name: createdRoute.name,
          slug: createdRoute.slug,
          introspectAuthorization: createdRoute.introspectAuthorization,
          enabled: createdRoute.enabled,
          collectionId: createdRoute.collectionId,
          tiers: createdRoute.tiers || [],
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
    acls: Acl[],
    company: Company,
    environment: KONG_ENVIRONMENT,
    user: User,
  ) {
    const consumerId = await this.updateConsumerId(company, environment);

    const routes = await this.routeRepository.find({
      where: {
        id: In(
          apiIds.filter(
            (apiId) =>
              !acls.some((acl) => {
                const [, ...values] = acl.group.split('-');
                const routeId = values.join('-');
                return routeId === apiId;
              }),
          ), // Where the API Ids are not already part of the allowed APIs for this company
        ),
        environment,
      },
    });

    const promises: Promise<{ aclId: string; routeId: string }>[] = [];

    routes.forEach(({ id: routeId }) => {
      promises.push(
        new Promise(async (res, rej) => {
          try {
            const response = await this.kongConsumerService.updateConsumerAcl(
              environment,
              {
                aclAllowedGroupName: `route-${routeId}`,
                consumerId: consumerId!,
              },
            );

            res({ aclId: response.id, routeId });
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

    const event = new AssignApiEvent(user, { apiIds, company });
    this.eventEmitter.emit(event.name, event);

    return { success: true };
  }

  async unassignAPIs(
    apiIds: string[],
    acls: Acl[],
    company: Company,
    environment: KONG_ENVIRONMENT,
    user: User,
  ) {
    const consumerId = company.id!;

    const promises: Promise<void>[] = [];

    acls.forEach((acl) => {
      const [, ...values] = acl.group.split('-');
      const routeId = values.join('-');
      if (apiIds.includes(routeId)) {
        promises.push(
          new Promise(async (res, rej) => {
            try {
              await this.kongConsumerService.deleteConsumerAcl(environment, {
                aclId: acl.id,
                consumerId,
              });
              res();
            } catch (err) {
              rej(err);
            }
          }),
        );
      }
    });

    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'rejected') {
        console.log({ result });
      }
    }

    const event = new UnassignApiEvent(user, { apiIds, company });
    this.eventEmitter.emit(event.name, event);

    return { success: true };
  }

  async updateCompanyApiAccess(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    companyId: string,
    { apiIds }: UpdateCompanyAPIAccessDto,
  ) {
    if (environment === KONG_ENVIRONMENT.DEVELOPMENT) {
      throw new IBadRequestException({
        message: 'Cannot configure API access for this environment',
      });
    }
    const company = await this.companyRepository.findOne({
      where: { id: Equal(companyId) },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(
          companyId ?? ctx.activeCompany.id,
        ),
      });
    }

    const routesFound = await this.routeRepository.find({
      where: {
        id: In(apiIds),
        environment,
      },
    });

    const missingRoutes = apiIds.filter(
      (apiId) => !routesFound.some((route) => route.id === apiId),
    );

    if (missingRoutes.length > 0) {
      throw new INotFoundException({
        message: `Routes with ids ${missingRoutes.join(', ')} were not found.`,
      });
    }

    let offset;
    const routeAcls = [];
    const consumerId = await this.updateConsumerId(company, environment);
    do {
      const response = await this.kongConsumerService.getConsumerAcls(
        environment,
        consumerId,
        offset,
      );
      offset = response.offset;
      for (const item of response.data) {
        const [type] = item.group.split('-');
        if (type === 'route') {
          routeAcls.push(item);
        }
      }
    } while (offset);

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(companyId!),
      });
    }

    // Routes to assign are present in apiIds array but not in previosAllowedRoutes array
    // Routes to unassign are present in previosAllowedRoutes array but not in apiIds array
    const previousAllowedRoutesIds = routeAcls.map((acl) => {
      const [, ...values] = acl.group.split('-');
      const value = values.join('-');
      return value;
    });

    const routesToUnassign = previousAllowedRoutesIds.filter(
      (routeId) => !apiIds.includes(routeId),
    );

    const routesToAssign = apiIds.filter(
      (newRouteId) => !previousAllowedRoutesIds.includes(newRouteId),
    );

    await Promise.allSettled([
      await this.assignAPIs(
        routesToAssign,
        routeAcls,
        company,
        environment,
        ctx.activeUser,
      ),
      await this.unassignAPIs(
        routesToUnassign,
        routeAcls,
        company,
        environment,
        ctx.activeUser,
      ),
    ]);

    return ResponseFormatter.success(apiSuccessMessages.updatedAPIAccess);
  }

  async updateAPI(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    routeId: string,
    data: UpdateAPIDto,
  ) {
    const { name, enabled, downstream, upstream, tiers } = data;
    let { slug, introspectAuthorization } = data;

    const route = await this.routeRepository.findOne({
      where: { id: Equal(routeId), environment },
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

    slug = slug || route.slug || slugify(name, { strict: true, lower: true });
    introspectAuthorization =
      introspectAuthorization ?? route.introspectAuthorization;

    await this.routeRepository.update(
      { id: route.id, environment },
      {
        name,
        slug,
        introspectAuthorization,
        serviceId: gatewayService.id,
        routeId: gatewayRoute.id,
        enabled,
        url: data.downstream.url,
        method: downstream.method,
        request: downstream.request,
        response: downstream.response,
        tiers,
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

    if (introspectAuthorization) {
      await this.kongRouteService.updateOrCreatePlugin(
        environment,
        gatewayRoute.id,
        {
          name: KONG_PLUGINS.OBN_AUTHORIZATION,
          enabled: true,
          config: {
            introspection_endpoint: this.config.get(
              'registry.introspectionEndpoint',
            )[environment],
            client_id: this.config.get('registry.introspectionClientID')[
              environment
            ],
            client_secret: this.config.get(
              'registry.introspectionClientSecret',
            )[environment],
            scope: [slug],
          },
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

    if (tiers) {
      const allow = [
        environment !== KONG_ENVIRONMENT.DEVELOPMENT
          ? `route-${routeId}`
          : undefined,
        ...tiers.map((tier) => `tier-${tier}`),
      ].filter(Boolean);
      if (allow.length) {
        await this.kongRouteService.updateOrCreatePlugin(
          environment,
          gatewayRoute.id,
          {
            config: {
              allow,
              hide_groups_header: true,
            },
            name: KONG_PLUGINS.ACL,
            enabled: true,
          },
        );
      }
    }

    const event = new UpdateApiEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      apiSuccessMessages.updatedAPI,
      new GetAPIResponseDTO(
        {
          id: route.id,
          name: data.name || route.name,
          slug,
          introspectAuthorization,
          enabled: data.enabled || route.enabled,
          collectionId: route.collectionId,
          tiers: data.tiers || route.tiers || [],
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
        id: In(
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

    const event = new GetApiLogEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
          id: Equal(logs.hits.hits[0]._source.consumer?.id),
        },
      });
    }

    logs.hits.hits[0]._source.consumer = company;

    const event = new GetApiLogEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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

    const event = new GetApiLogStatsEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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

    const event = new GetApiLogStatsEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
    pagination?: PaginationParameters,
    filters?: any,
  ) {
    const { limit, page } = pagination!;

    const company = await this.companyRepository.findOne({
      where: { id: Equal(companyId ?? ctx.activeCompany.id) },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(
          companyId ?? ctx.activeCompany.id,
        ),
      });
    }

    let routes: CollectionRoute[];
    let totalNumberOfRecords: number;

    if (environment !== KONG_ENVIRONMENT.DEVELOPMENT) {
      let offset;
      const routesIds = [];
      const consumerId = company.id;
      do {
        const response = await this.kongConsumerService.getConsumerAcls(
          environment,
          consumerId,
          offset,
        );
        offset = response.offset;
        for (const item of response.data) {
          const [type, ...values] = item.group.split('-');
          const value = values.join('-');
          if (type === 'route') {
            routesIds.push(value);
          }
        }
      } while (offset);
      const [iRoutes, iTotalNumberOfRecords] =
        await this.routeRepository.findAndCount({
          where: [
            {
              ...filters,
              environment,
              id: In(routesIds),
            },
            {
              ...filters,
              environment,
              // TODO find much more optimal way.
              tiers: Like(`%${company.tier}%`),
            },
          ],
          order: { createdAt: 'DESC' },
          skip: (page - 1) * limit,
          take: limit,
        });

      totalNumberOfRecords = iTotalNumberOfRecords;
      routes = iRoutes;
    } else {
      const [iRoutes, iTotalNumberOfRecords] =
        await this.routeRepository.findAndCount({
          where: { ...filters, environment },
          skip: (page - 1) * limit,
          take: limit,
          order: { createdAt: 'DESC' },
        });

      totalNumberOfRecords = iTotalNumberOfRecords;
      routes = iRoutes;
    }

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
            slug: route.slug,
            introspectAuthorization: route.introspectAuthorization,
            enabled: route.enabled,
            collectionId: route.collectionId,
            tiers: route.tiers || [],
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

    const event = new ViewCompanyApisEvent(ctx.activeUser, {
      companyId: company.id,
    });
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      apiSuccessMessages.fetchedAPIs,
      populatedRoutes,
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async getTransformation(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    routeId: string,
  ) {
    const route = await this.routeRepository.findOne({
      where: { id: Equal(routeId), environment },
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
      (plugin) => plugin.name === KONG_PLUGINS.POST_FUNCTION,
    );

    if (!plugin) {
      throw new INotFoundException({
        message: apiErrorMessages.functionNotFound(routeId),
      });
    }

    const event = new GetApiTransformationEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

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
      where: { id: Equal(routeId), environment },
      relations: { collection: true },
    });

    if (!route) {
      throw new INotFoundException({
        message: apiErrorMessages.routeNotFound(routeId),
      });
    }

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
        name: KONG_PLUGINS.POST_FUNCTION,
        enabled: true,
      },
    );

    const event = new SetApiTransformationEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      apiSuccessMessages.updatedAPI,
      new GetAPITransformationResponseDTO(plugin.config, ctx),
    );
  }
}
