import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
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
import {
  Ctx,
  RequireTwoFA,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { RequestContext } from '@common/utils/request/request-context';
import { PERMISSIONS } from '@permissions/types';
import { APIParam } from 'src/apis/dto/index.dto';
import { APIInterceptor } from 'src/apis/apis.interceptor';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_API_COLLECTIONS)
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
  @RequiredPermission(PERMISSIONS.CREATE_API_COLLECTION)
  @RequireTwoFA()
  createCollection(
    @Ctx() ctx: RequestContext,
    @Body() data: CreateCollectionDto,
  ) {
    return this.collectionsService.createCollection(ctx, data);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_API_COLLECTION)
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
  @RequiredPermission(PERMISSIONS.VIEW_API_COLLECTION)
  viewCollection(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.collectionsService.viewCollection(ctx, id);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.DELETE_API_COLLECTION)
  @RequireTwoFA()
  deleteCollection(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.collectionsService.deleteCollection(ctx, id);
  }

  @Get(':environment/company')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.VIEW_ASSIGNED_API_ENDPOINTS)
  @UseInterceptors(APIInterceptor)
  viewMyCompanyApis(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query('filter') filters: any,
  ) {
    return this.collectionsService.getCollectionsAssignedToCompany(
      ctx,
      params.environment,
      undefined,
      pagination,
      filters,
    );
  }

  @Get(':environment/company/:companyId')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.AP_VIEW_ASSIGNED_API_ENDPOINTS)
  viewCompanyApis(
    @Ctx() ctx: RequestContext,
    @Param() params: APIParam,
    @Param('companyId') companyId: string,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query('filter') filters: any,
  ) {
    return this.collectionsService.getCollectionsAssignedToCompany(
      ctx,
      params.environment,
      companyId,
      pagination,
      filters,
    );
  }
}
