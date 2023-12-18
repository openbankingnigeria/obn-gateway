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
import { RequireTwoFA } from '@common/utils/authentication/auth.decorator';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @UsePipes(IValidationPipe)
  listCollections(
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(CollectionFilters.listCollections))
    filters: any,
  ) {
    return this.collectionsService.listCollections(pagination, filters);
  }

  @Post()
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  createCollection(@Body() data: CreateCollectionDto) {
    return this.collectionsService.createCollection(data);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  updateCollection(@Param('id') id: string, @Body() data: UpdateCollectionDto) {
    return this.collectionsService.updateCollection(id, data);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  viewCollection(@Param('id') id: string) {
    return this.collectionsService.viewCollection(id);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  deleteCollection(@Param('id') id: string) {
    return this.collectionsService.deleteCollection(id);
  }
}
