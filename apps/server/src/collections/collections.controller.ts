import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { CreateCollectionDto, UpdateCollectionDto } from './dto/index.dto';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import { CollectionFilters } from './collections.filter';
import { Ctx, RequireTwoFA } from '@common/utils/authentication/auth.decorator';
import { RequestContext } from '@common/utils/request/request-context';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @UsePipes(IValidationPipe)
  listCollections(
    @Ctx() ctx: RequestContext,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(CollectionFilters.listCollections))
    filters: any,
  ) {
    return this.collectionsService.listCollections(ctx, pagination, filters);
  }

  @Post()
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  createCollection(
    @Ctx() ctx: RequestContext,
    @Body() data: CreateCollectionDto,
  ) {
    return this.collectionsService.createCollection(ctx, data);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  updateCollection(
    @Ctx() ctx: RequestContext,
    @Param('id') id: string,
    @Body() data: UpdateCollectionDto,
  ) {
    return this.collectionsService.updateCollection(ctx, id, data);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  viewCollection(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.collectionsService.viewCollection(ctx, id);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  deleteCollection(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.collectionsService.deleteCollection(ctx, id);
  }
}
