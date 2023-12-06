import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/database/entities';
import { In, IsNull, Not, Repository } from 'typeorm';
import slugify from 'slugify';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { roleErrors } from '@roles/role.errors';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { RequestContextService } from 'src/common/utils/request/request-context.service';
import { Permission } from 'src/common/database/entities/permission.entity';
import { RolePermission } from 'src/common/database/entities/rolepermission.entity';
import { roleErrorMessages, roleSuccessMessages } from '@roles/role.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';

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
        companyId: this.requestContext.user!.companyId,
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
        companyId: this.requestContext.user!.companyId,
      }),
    );

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.createdRole, role);
  }

  async listRoles({ limit, page }: PaginationParameters, filters?: any) {
    const where = [
      {
        parentId: this.requestContext.user!.role.parentId,
        companyId: this.requestContext.user!.companyId,
        ...filters,
      },
      {
        parentId: IsNull(),
        companyId: IsNull(),
        ...filters,
      },
    ];

    const totalRoles = await this.roleRepository.count({ where });

    const roles = await this.roleRepository.find({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.fetchedRole, roles, {
      totalNumberOfRecords: totalRoles,
      totalNumberOfPages: Math.ceil(totalRoles / limit),
      pageNumber: page,
      pageSize: limit,
    });
  }

  async getRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: [
        {
          id,
          parentId: this.requestContext.user!.role.parentId,
          companyId: this.requestContext.user!.companyId,
        },
        {
          id,
          parentId: IsNull(),
          companyId: IsNull(),
        },
      ],
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.fetchedRole, role);
  }

  async updateRole(id: string, data: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        parentId: this.requestContext.user!.role.parentId,
        companyId: this.requestContext.user!.companyId,
      },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    const { description, status } = data;

    const updatedRole = await this.roleRepository.update(
      { id: role.id },
      this.roleRepository.create({
        description,
        status,
      }),
    );

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.updatedRole,
      updatedRole,
    );
  }

  async deleteRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        parentId: this.requestContext.user!.role.parentId,
        companyId: this.requestContext.user!.companyId,
      },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    await this.roleRepository.softDelete({ id: role.id });

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.deletedRole, null);
  }

  async getRolePermissions(id: string) {
    const role = await this.roleRepository.findOne({
      where: [
        {
          id,
          parentId: this.requestContext.user!.role.parentId,
          companyId: this.requestContext.user!.companyId,
        },
        {
          id,
          parentId: IsNull(),
          companyId: IsNull(),
        },
      ],
      relations: { permissions: true },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.fetchedRole,
      role.permissions,
    );
  }

  async setRolePermissions(
    id: string,
    permissions: SetRolePermissionsDto['permissions'],
  ) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        parentId: this.requestContext.user!.role.parentId,
        companyId: this.requestContext.user!.companyId,
      },
      relations: { rolePermissions: true },
    });

    if (!role) {
      throw new IBadRequestException({
        message: roleErrors.roleNotFound,
      });
    }

    const newPermissions = permissions.filter((permission) => {
      return !role.rolePermissions.find(
        (rolePermission) => rolePermission.permissionId === permission,
      );
    });

    const newPermissionsData = await this.permissionRepository.find({
      where: {
        id: In(newPermissions),
        roles: { roleId: this.requestContext.user!.role.parentId },
      },
    });

    for (const newPermission of newPermissions) {
      const permissionExists = newPermissionsData.find(
        ({ id }) => id === newPermission,
      );
      if (!permissionExists) {
        throw new IBadRequestException({
          message: roleErrorMessages.permissionNotFound(newPermission),
        });
      }
    }

    await this.rolePermissionRepository.softDelete({
      permissionId: Not(In(permissions)),
      roleId: role.id,
    });

    await this.rolePermissionRepository.insert(
      newPermissions.map((permissionId) => ({ roleId: role.id, permissionId })),
    );

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.updatedRole);
  }

  // TODO how do we ensure that if a parents permission is leaked to a created role, that permission cannot be used.
  async getPermissions() {
    const permissions = await this.permissionRepository.find({
      where: { roles: { roleId: this.requestContext.user!.role.parentId } },
    });
    return ResponseFormatter.success(
      roleSuccessMessages.fetchedPermissions,
      permissions,
    );
  }
}
