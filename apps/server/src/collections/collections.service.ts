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
import { Like, Repository } from 'typeorm';
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
import { CollectionRoute } from '@common/database/entities/collectionroute.entity';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { GetAPIResponseDTO } from 'src/apis/dto/index.dto';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { Company } from '@common/database/entities';
import { companyErrors } from '@company/company.errors';

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

    // TODO emit event
    return ResponseFormatter.success(
      collectionsSuccessMessages.fetchedCollections,
      collections.map((collection) => {
        const dto = new GetCollectionResponseDTO(collection);
        dto.apis = collection.apis!.map((api) => new GetAPIResponseDTO(api));
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
      where: [{ id: idOrSlug }, { slug: idOrSlug }],
    });

    if (!collection) {
      throw new INotFoundException({
        message: collectionErrorMessages.collectionNotFound(idOrSlug),
      });
    }

    // TODO emit event

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

    // TODO emit event

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
      where: { id },
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

    // TODO emit event

    return ResponseFormatter.success(
      collectionsSuccessMessages.updatedCollection,
      new GetCollectionResponseDTO(collection),
    );
  }

  async deleteCollection(ctx: RequestContext, id: string) {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new INotFoundException({
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

  async getCollectionsAssignedToCompany(
    ctx: RequestContext,
    environment: KONG_ENVIRONMENT,
    companyId?: string,
    pagination?: PaginationParameters,
    filters?: any,
  ) {
    const { limit, page } = pagination!;

    const company = await this.companyRepository.findOne({
      where: { id: companyId ?? ctx.activeCompany.id },
    });

    if (!company) {
      throw new IBadRequestException({
        message: companyErrors.companyNotFound(
          companyId ?? ctx.activeCompany.id,
        ),
      });
    }

    const [collections, totalNumberOfRecords] = await Promise.all([
      await this.collectionRepository
        .createQueryBuilder('collection')
        .leftJoinAndSelect('collection.apis', 'route')
        .leftJoin('route.acls', 'acl')
        .where(
          environment === KONG_ENVIRONMENT.PRODUCTION
            ? 'acl.companyId = :companyId AND acl.environment = :environment'
            : '',
          { companyId: company.id, environment },
        )
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
        .addGroupBy('collection.name')
        .getRawMany(),
      await this.collectionRepository.count({
        where: {
          name: Like(`%${filters?.name ?? ''}%`),
          slug: Like(`%${filters?.slug ?? ''}%`),
          apis: {
            acls:
              environment === KONG_ENVIRONMENT.DEVELOPMENT
                ? {}
                : {
                    companyId: company.id,
                    environment,
                  },
          },
        },
      }),
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
