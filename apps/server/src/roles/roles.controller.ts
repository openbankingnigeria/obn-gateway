import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UsePipes,
  Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import {
  PaginationParameters,
  PaginationPipe,
} from '@common/utils/pipes/query/pagination.pipe';
import { FilterPipe } from '@common/utils/pipes/query/filter.pipe';
import {
  Ctx,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { RoleFilters } from './roles.filter';
import { RequestContext } from '@common/utils/request/request-context';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.CREATE_ROLE)
  createRole(@Ctx() ctx: RequestContext, @Body() data: CreateRoleDto) {
    return this.rolesService.createRole(ctx, data);
  }

  @Get()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  listRoles(
    @Ctx() ctx: RequestContext,
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(RoleFilters.listRoles))
    filters: any,
  ) {
    return this.rolesService.listRoles(ctx, pagination, filters);
  }

  @Get('stats')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getStats(@Ctx() ctx: RequestContext) {
    return this.rolesService.getStats(ctx);
  }

  @Get('permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getPermissions(@Ctx() ctx: RequestContext) {
    return this.rolesService.getPermissions(ctx);
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getRole(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.rolesService.getRole(ctx, id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_ROLE)
  updateRole(
    @Ctx() ctx: RequestContext,
    @Param('id') id: string,
    @Body() data: UpdateRoleDto,
  ) {
    return this.rolesService.updateRole(ctx, id, data);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.DELETE_ROLE)
  deleteRole(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.rolesService.deleteRole(ctx, id);
  }

  @Get(':id/permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getRolePermissions(@Ctx() ctx: RequestContext, @Param('id') id: string) {
    return this.rolesService.getRolePermissions(ctx, id);
  }

  @Put(':id/permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_ROLE)
  setRolePermissions(
    @Ctx() ctx: RequestContext,
    @Param('id') id: string,
    @Body() data: SetRolePermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(ctx, id, data.permissions);
  }
}
