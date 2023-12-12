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
  RequireTwoFA,
  RequiredPermission,
} from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { RoleFilters } from './roles.filter';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.CREATE_ROLE)
  @RequireTwoFA()
  createRole(@Body() data: CreateRoleDto) {
    return this.rolesService.createRole(data);
  }

  @Get()
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  listRoles(
    @Query(PaginationPipe) pagination: PaginationParameters,
    @Query(new FilterPipe(RoleFilters.listRoles))
    filters: any,
  ) {
    return this.rolesService.listRoles(pagination, filters);
  }

  @Get('stats')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getStats() {
    return this.rolesService.getStats();
  }

  @Get('permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getRole(@Param('id') id: string) {
    return this.rolesService.getRole(id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_ROLE)
  @RequireTwoFA()
  updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.DEACTIVATE_ROLE)
  @RequireTwoFA()
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.LIST_ROLES)
  getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @UsePipes(IValidationPipe)
  @RequiredPermission(PERMISSIONS.UPDATE_ROLE)
  @RequireTwoFA()
  setRolePermissions(
    @Param('id') id: string,
    @Body() data: SetRolePermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(id, data.permissions);
  }
}
