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
import { Repository } from 'typeorm';
import {
  CreateCollectionDto,
  GetCollectionResponseDTO,
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
}
