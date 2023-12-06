import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  CreateAPIDto,
  CreateCollectionDto,
  UpdateAPIDto,
  UpdateCollectionDto,
} from './dto/index.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @UsePipes(IValidationPipe)
  listCollections() {
    return this.collectionsService.listCollections();
  }

  @Post()
  @UsePipes(IValidationPipe)
  createCollection(@Body() data: CreateCollectionDto) {
    return this.collectionsService.createCollection(data);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  updateCollection(@Param('id') id: string, @Body() data: UpdateCollectionDto) {
    return this.collectionsService.updateCollection(id, data);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  viewCollection(@Param('id') id: string) {
    return this.collectionsService.viewCollection(id);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  deleteCollection(@Param('id') id: string) {
    return this.collectionsService.deleteCollection(id);
  }

  @Get(':id/apis')
  @UsePipes(IValidationPipe)
  viewAPIs(@Param('id') id: string) {
    return this.collectionsService.viewAPIs(id);
  }

  @Post(':id/apis')
  @UsePipes(IValidationPipe)
  createAPI(@Param('id') id: string, @Body() data: CreateAPIDto) {
    return this.collectionsService.createAPI(id, data);
  }

  @Get('apis/:id')
  @UsePipes(IValidationPipe)
  viewAPI(@Param('id') id: string) {
    return this.collectionsService.viewAPI(id);
  }

  @Delete('apis/:id')
  @UsePipes(IValidationPipe)
  deletAPI(@Param('id') id: string) {
    return this.collectionsService.deleteAPI(id);
  }

  @Patch('apis/:id')
  @UsePipes(IValidationPipe)
  updateAPI(@Param('id') id: string, @Body() data: UpdateAPIDto) {
    return this.collectionsService.updateAPI(id, data);
  }
}
