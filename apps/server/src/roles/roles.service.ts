import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/database/entities';
import { In, Not, Repository } from 'typeorm';
import slugify from 'slugify';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { roleErrors } from 'src/common/constants/errors/role.errors';
import { ResponseFormatter } from 'src/common/utils/common/response.util';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { Permission } from 'src/common/database/entities/permission.entity';
import { RolePermission } from 'src/common/database/entities/rolepermission.entity';

@Injectable()
export class RolesService {
  constructor(
    private readonly requestContext: RequestContextService,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async createRole(data: CreateRoleDto) {
    const roleExists = await this.roleRepository.count({
      where: {
        name: data.name,
      },
    });

    if (roleExists) {
      throw new IBadRequestException({
        message: roleErrors.roleWithNameExists(data.name),
      });
    }

    const { name, description, status } = data;

    const role = await this.roleRepository.save(
      this.roleRepository.create({
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description,
        status,
        parentId: this.requestContext.user!.role.parentId,
      }),
    );

    return ResponseFormatter.success('', role);
  }

  async listRoles() {
    const roles = await this.roleRepository.find({
      where: { parentId: this.requestContext.user!.role.parentId },
    });
    return ResponseFormatter.success('', roles);
  }

  async getRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id, parentId: this.requestContext.user!.role.parentId },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    return ResponseFormatter.success('', role);
  }

  async updateRole(id: string, data: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: { id, parentId: this.requestContext.user!.role.parentId },
      // TODO update role by company
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    const { description, status } = data;

    await this.roleRepository.update(
      { id: role.id },
      this.roleRepository.create({
        description,
        status,
      }),
    );

    return ResponseFormatter.success('', role);
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id, parentId: this.requestContext.user!.role.parentId },
      // TODO delete role by company
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    await this.roleRepository.softDelete({ id: role.id });

    return ResponseFormatter.success('', null);
  }

  async getRolePermissions(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id, parentId: this.requestContext.user!.role.parentId },
      relations: { permissions: { permission: true } },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    return ResponseFormatter.success('', role.permissions);
  }

  async setRolePermissions(
    id: string,
    permissions: SetRolePermissionsDto['permissions'],
  ) {
    const role = await this.roleRepository.findOne({
      where: { id, parentId: this.requestContext.user!.role.parentId },
      relations: { permissions: true },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    await this.rolePermissionRepository.softDelete({
      permissionId: Not(In(permissions)),
      roleId: role.id,
    });

    const newPermissions = permissions.filter((permission) => {
      return !role.permissions.find(
        (rolePermission) => rolePermission.permissionId === permission,
      );
    });

    await this.rolePermissionRepository.insert(
      newPermissions.map((permissionId) => ({ roleId: role.id, permissionId })),
    );

    return ResponseFormatter.success('');
  }

  async getPermissions() {
    const permissions = await this.permissionRepository.find({});
    return ResponseFormatter.success('', permissions);
  }
}
