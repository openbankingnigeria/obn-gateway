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
import { RequiredPermission } from '@common/utils/authentication/auth.decorator';
import { PERMISSIONS } from '@permissions/types';
import { RoleFilters } from './roles.filter';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(IValidationPipe)
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

  @Get('permissions')
  @UsePipes(IValidationPipe)
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get(':id')
  @UsePipes(IValidationPipe)
  getRole(@Param('id') id: string) {
    return this.rolesService.getRole(id);
  }

  @Patch(':id')
  @UsePipes(IValidationPipe)
  updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  @UsePipes(IValidationPipe)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  @UsePipes(IValidationPipe)
  getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @UsePipes(IValidationPipe)
  setRolePermissions(
    @Param('id') id: string,
    @Body() data: SetRolePermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(id, data.permissions);
  }
}
