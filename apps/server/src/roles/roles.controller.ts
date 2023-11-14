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
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

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
  listRoles() {
    return this.rolesService.listRoles();
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
