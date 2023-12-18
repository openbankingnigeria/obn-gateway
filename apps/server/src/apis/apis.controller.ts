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
import { APIService } from './apis.service';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { APIParam, CreateAPIDto, UpdateAPIDto } from './dto/index.dto';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import { APIFilters } from './apis.filter';
import { RequireTwoFA } from '@common/utils/authentication/auth.decorator';

@Controller('apis/:environment')
export class APIController {
  constructor(private readonly apiService: APIService) {}

  @Get('')
  @UsePipes(IValidationPipe)
  viewAPIs(
    @Param() params: APIParam,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(APIFilters.listAPIs))
    filters: any,
  ) {
    return this.apiService.viewAPIs(params.environment, pagination, filters);
  }

  @Post('')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  createAPI(@Param() params: APIParam, @Body() data: CreateAPIDto) {
    return this.apiService.createAPI(params.environment, data);
  }

  @Get('logs')
  @UsePipes(IValidationPipe)
  getAPILogs() {
    return this.apiService.getAPILogs();
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  viewAPI(@Param() params: APIParam, @Param('id') id: string) {
    return this.apiService.viewAPI(params.environment, id);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  deletAPI(@Param() params: APIParam, @Param('id') id: string) {
    return this.apiService.deleteAPI(params.environment, id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequireTwoFA()
  updateAPI(
    @Param() params: APIParam,
    @Param('id') id: string,
    @Body() data: UpdateAPIDto,
  ) {
    return this.apiService.updateAPI(params.environment, id, data);
  }
}
