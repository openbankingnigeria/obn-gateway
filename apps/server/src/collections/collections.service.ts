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
import { Equal, Repository } from 'typeorm';
import {
  CreateCollectionDto,
  GetCollectionResponseDTO,
  GetCompanyCollectionResponseDTO,
  UpdateCollectionDto,
} from './dto/index.dto';
import slugify from 'slugify';
import {
  collectionErrorMessages,
  collectionsSuccessMessages,
} from './collections.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { GetAPIResponseDTO } from 'src/apis/dto/index.dto';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import {
  Company,
  Collection,
  CollectionRoute,
} from '@common/database/entities';
import { companyErrors } from '@company/company.errors';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateCollectionEvent,
  DeleteCollectionEvent,
  UpdateCollectionEvent,
} from '@shared/events/collections.event';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(CollectionRoute)
    private readonly routeRepository: Repository<CollectionRoute>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly kongService: KongServiceService,
    private readonly kongRouteService: KongRouteService,
    private readonly kongConsumerService: KongConsumerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async listCollections(
    ctx: RequestContext,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const [collections, totalNumberOfRecords] =
      await this.collectionRepository.findAndCount({
        where: { ...filters },
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: { apis: true },
      });

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollections,
      collections.map((collection) => {
        const dto = new GetCollectionResponseDTO(collection);
        dto.apis = collection.apis!.map(
          (api) =>
            new GetAPIResponseDTO({
              ...api,
              tiers: api.tiers || [],
            }),
        );
        return dto;
      }),
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async viewCollection(ctx: RequestContext, idOrSlug: string) {
    const collection = await this.collectionRepository.findOne({
      where: [{ id: Equal(idOrSlug) }, { slug: Equal(idOrSlug) }],
    });

    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(idOrSlug),
      });
    }

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async createCollection(ctx: RequestContext, data: CreateCollectionDto) {
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

    const event = new CreateCollectionEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      collectionsSuccessMessages.createdCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async updateCollection(
    ctx: RequestContext,
    id: string,
    data: UpdateCollectionDto,
  ) {
    const collection = await this.collectionRepository.findOne({
      where: { id: Equal(id) },
    });

    if (!collection) {
      throw new INotFoundException({
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

    const event = new UpdateCollectionEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      collectionsSuccessMessages.updatedCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async deleteCollection(ctx: RequestContext, id: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id: Equal(id) },
    });

    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(id),
      });
    }

    const routes = await this.routeRepository.find({
      where: { collectionId: Equal(id) },
    });

    if (routes.length) {
      throw new IBadRequestException({
        message: collectionErrorMessages.collectionNotEmpty,
      });
    }

    await this.collectionRepository.softDelete({
      id,
    });

    const event = new DeleteCollectionEvent(ctx.activeUser, {});
    this.eventEmitter.emit(event.name, event);

    return ResponseFormatter.success(
      collectionsSuccessMessages.deletedCollection,
    );
  }

  async getCollectionsAssignedToCompany(
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

    let offset;
    const tiers = [],
      routes = [];
    if (environment !== KONG_ENVIRONMENT.DEVELOPMENT) {
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
          if (type === 'tier') {
            tiers.push(value);
          } else if (type === 'route') {
            routes.push(value);
          }
        }
      } while (offset);
    }

    const query = this.collectionRepository
      .createQueryBuilder('collection')
      .leftJoinAndSelect('collection.apis', 'route')
      .where('route.environment = :environment', {
        environment,
      })
      // TODO pass as parameter
      .andWhere(
        `collection.name LIKE '%${
          filters?.name ?? ''
        }%' AND collection.slug LIKE '%${filters?.slug ?? ''}%'`,
      )
      .orderBy('collection.name')
      .offset((page - 1) * limit)
      .limit(limit)
      .select([
        'collection.id AS id',
        'collection.name AS name',
        'collection.description AS description',
        'COUNT(route.id) AS routeCount',
      ])
      .groupBy('collection.id')
      .addGroupBy('collection.name');

    if (routes.length || tiers.length) {
      if (routes.length && tiers.length) {
        query.andWhere('route.id IN (:routes) OR route.tiers IN (:tiers)', {
          routes,
          tiers,
        });
      } else if (routes.length) {
        query.andWhere('route.id IN (:routes)', { routes });
      } else if (tiers.length) {
        query.andWhere('route.tiers IN (:tiers)', { tiers });
      }
    }

    const [collections, totalNumberOfRecords] = await Promise.all([
      await query.getRawMany(),
      await query.getCount(),
    ]);

    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollection,
      collections.map(
        (collection) => new GetCompanyCollectionResponseDTO(collection),
      ),
      new ResponseMetaDTO({
        totalNumberOfRecords,
        totalNumberOfPages: Math.ceil(totalNumberOfRecords / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }
}
