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
  ValidationPipe,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UsePipes(ValidationPipe)
  createRole(@Body() data: CreateRoleDto) {
    return this.rolesService.createRole(data);
  }

  @Get()
  @UsePipes(ValidationPipe)
  listRoles() {
    return this.rolesService.listRoles();
  }

  @Get('permissions')
  @UsePipes(ValidationPipe)
  getPermissions() {
    return this.rolesService.getPermissions();
  }

  @Get(':id')
  @UsePipes(ValidationPipe)
  getRole(@Param('id') id: string) {
    return this.rolesService.getRole(id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  updateRole(@Param('id') id: string, @Body() data: UpdateRoleDto) {
    return this.rolesService.updateRole(id, data);
  }

  @Delete(':id')
  @UsePipes(ValidationPipe)
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }

  @Get(':id/permissions')
  @UsePipes(ValidationPipe)
  getRolePermissions(@Param('id') id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Put(':id/permissions')
  @UsePipes(ValidationPipe)
  setRolePermissions(
    @Param('id') id: string,
    @Body() data: SetRolePermissionsDto,
  ) {
    return this.rolesService.setRolePermissions(id, data.permissions);
  }
}
