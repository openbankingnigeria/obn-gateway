import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UsePipes,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import {
  Ctx,
  RequireTwoFA,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { UserFilters } from './users.filter';
import { RequestContext } from '@common/utils/request/request-context';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.ADD_TEAM_MEMBERS)
  @RequireTwoFA()
  createUser(@Ctx() ctx: RequestContext, @Body() data: CreateUserDto) {
    return this.usersService.createUser(ctx, data);
  }

  @Post(':id/resend')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.ADD_TEAM_MEMBERS)
  @RequireTwoFA()
  resendInvite(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.usersService.resendInvite(ctx, id);
  }

  @Get()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_TEAM_MEMBERS)
  listUsers(
    @Ctx() ctx: RequestContext,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(UserFilters.listUsers))
    filters: any,
  ) {
    return this.usersService.listUsers(ctx, pagination, filters);
  }

  @Get('stats')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_TEAM_MEMBERS)
  getStats(@Ctx() ctx: RequestContext) {
    return this.usersService.getStats(ctx);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.VIEW_TEAM_MEMBER)
  getUser(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.usersService.getUser(ctx, id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_TEAM_MEMBER)
  @RequireTwoFA()
  updateUser(
    @Ctx() ctx: RequestContext,
    @Param('id') id: string,
    @Body() data: UpdateUserDto,
  ) {
    return this.usersService.updateUser(ctx, id, data);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.DELETE_TEAM_MEMBER)
  @RequireTwoFA()
  deleteUser(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.usersService.deleteUser(ctx, id);
  }
}
