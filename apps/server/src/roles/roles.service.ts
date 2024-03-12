import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Role,
  RoleStatuses,
  Permission,
  RolePermission,
} from '@common/database/entities';
import { Equal, In, IsNull, Not, Repository } from 'typeorm';
import slugify from 'slugify';
import {
  CreateRoleDto,
  GetPermissionResponseDTO,
  GetRoleResponseDTO,
  GetStatsResponseDTO,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import {
  IBadRequestException,
  IForbiddenException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { roleErrors } from '@roles/role.errors';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { roleErrorMessages, roleSuccessMessages } from '@roles/role.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { authErrors } from '@auth/auth.errors';
import { PERMISSIONS } from '@permissions/types';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepository: Repository<RolePermission>,
  ) {}

  async createRole(ctx: RequestContext, data: CreateRoleDto) {
    const roleExists = await this.roleRepository.count({
      where: {
        name: data.name,
        companyId: ctx.activeUser.companyId,
      },
    });

    if (roleExists) {
      throw new IBadRequestException({
        message: roleErrors.roleWithNameExists(data.name),
      });
    }

    const { name, description, status, permissions } = data;

    const permissionsData = await this.permissionRepository.find({
      where: {
        id: In(permissions),
        roles: { roleId: ctx.activeUser.role.parentId },
      },
    });

    for (const permission of permissions) {
      const permissionExists = permissionsData.find(
        ({ id }) => id === permission,
      );
      if (!permissionExists) {
        throw new IBadRequestException({
          message: roleErrorMessages.permissionNotFound(permission),
        });
      }
    }

    const role = await this.roleRepository.save(
      this.roleRepository.create({
        name,
        slug: slugify(name, { lower: true, strict: true }),
        description,
        status,
        parentId: ctx.activeUser.role.parentId,
        companyId: ctx.activeUser.companyId,
      }),
    );

    await this.rolePermissionRepository.insert(
      permissions.map((permissionId) => ({ roleId: role.id, permissionId })),
    );

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.createdRole,
      new GetRoleResponseDTO(role),
    );
  }

  async listRoles(
    ctx: RequestContext,
    { limit, page }: PaginationParameters,
    filters?: any,
  ) {
    const where = {
      ...filters,
      parentId: Equal(ctx.activeUser.role.parentId),
      companyId: Equal(ctx.activeUser.companyId),
    };

    const totalRoles = await this.roleRepository.count({ where });

    const roles = await this.roleRepository.find({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.fetchedRole,
      roles.map((role) => new GetRoleResponseDTO(role)),
      new ResponseMetaDTO({
        totalNumberOfRecords: totalRoles,
        totalNumberOfPages: Math.ceil(totalRoles / limit),
        pageNumber: page,
        pageSize: limit,
      }),
    );
  }

  async getRole(ctx: RequestContext, id: string) {
    const role = await this.roleRepository.findOne({
      where: [
        {
          id: Equal(id),
          parentId: Equal(ctx.activeUser.role.parentId),
          companyId: Equal(ctx.activeUser.companyId),
        },
        {
          id: Equal(id),
          companyId: IsNull(),
        },
      ],
    });

    if (!role) {
      throw new INotFoundException({
        message: roleErrors.roleNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.fetchedRole,
      new GetRoleResponseDTO(role),
    );
  }

  async updateRole(ctx: RequestContext, id: string, data: UpdateRoleDto) {
    const role = await this.roleRepository.findOne({
      where: {
        id: Equal(id),
        parentId: Equal(ctx.activeUser.role.parentId),
        companyId: Equal(ctx.activeUser.companyId),
      },
    });

    if (!role) {
      throw new INotFoundException({
        message: roleErrors.roleNotFound,
      });
    }

    const { description, status } = data;

    if (status && status !== role.status) {
      if (
        status === RoleStatuses.ACTIVE &&
        !ctx?.hasPermission(PERMISSIONS.ACTIVATE_ROLE)
      ) {
        throw new IForbiddenException({
          message: authErrors.inadequatePermissions(PERMISSIONS.ACTIVATE_ROLE),
        });
      }
      if (
        status === RoleStatuses.INACTIVE &&
        !ctx?.hasPermission(PERMISSIONS.DEACTIVATE_ROLE)
      ) {
        throw new IForbiddenException({
          message: authErrors.inadequatePermissions(
            PERMISSIONS.DEACTIVATE_ROLE,
          ),
        });
      }
    }

    const updatedRole = this.roleRepository.create({
      description,
      status,
    });

    await this.roleRepository.update({ id: role.id }, updatedRole);

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.updatedRole,
      new GetRoleResponseDTO(Object.assign({}, role, updatedRole)),
    );
  }

  async deleteRole(ctx: RequestContext, id: string) {
    const role = await this.roleRepository.findOne({
      where: {
        id: Equal(id),
        parentId: Equal(ctx.activeUser.role.parentId),
        companyId: Equal(ctx.activeUser.companyId),
      },
    });

    if (!role) {
      throw new INotFoundException({
        message: roleErrors.roleNotFound,
      });
    }

    await this.roleRepository.softDelete({ id: role.id });

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.deletedRole);
  }

  async getRolePermissions(ctx: RequestContext, id: string) {
    const role = await this.roleRepository.findOne({
      where: [
        {
          id: Equal(id),
          parentId: Equal(ctx.activeUser.role.parentId),
          companyId: Equal(ctx.activeUser.companyId),
        },
        {
          id: Equal(id),
          companyId: IsNull(),
        },
      ],
      relations: { permissions: true },
    });

    if (!role) {
      throw new INotFoundException({
        message: roleErrors.roleNotFound,
      });
    }

    // TODO emit event

    return ResponseFormatter.success(
      roleSuccessMessages.fetchedRole,
      role.permissions.map(
        (permission) => new GetPermissionResponseDTO(permission),
      ),
    );
  }

  async setRolePermissions(
    ctx: RequestContext,
    id: string,
    permissions: SetRolePermissionsDto['permissions'],
  ) {
    const role = await this.roleRepository.findOne({
      where: {
        id,
        parentId: ctx.activeUser.role.parentId,
        companyId: ctx.activeUser.companyId,
      },
      relations: { rolePermissions: true },
    });

    if (!role) {
      throw new INotFoundException({
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
        roles: { roleId: Equal(ctx.activeUser.role.parentId) },
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

    await this.rolePermissionRepository.delete({
      permissionId: Not(In(permissions)),
      roleId: role.id,
    });

    await this.rolePermissionRepository.insert(
      newPermissions.map((permissionId) => ({ roleId: role.id, permissionId })),
    );

    // TODO emit event

    return ResponseFormatter.success(roleSuccessMessages.updatedRole);
  }

  async getPermissions(ctx: RequestContext) {
    const permissions = await this.permissionRepository.find({
      where: { roles: { roleId: Equal(ctx.activeUser.role.parentId) } },
    });
    return ResponseFormatter.success(
      roleSuccessMessages.fetchedPermissions,
      permissions.map((permission) => new GetPermissionResponseDTO(permission)),
    );
  }

  async getStats(ctx: RequestContext) {
    const stats = await this.roleRepository.query(
      `SELECT IFNULL(count(roles.id), 0) count, definitions.value
    FROM
      roles
      RIGHT OUTER JOIN (${Object.values(RoleStatuses)
        .map((status) => `SELECT '${status}' AS \`key\`, '${status}' AS value`)
        .join(' UNION ')}) definitions ON roles.status = definitions.key
        AND roles.deleted_at IS NULL
        AND roles.company_id = ?
    GROUP BY
      definitions.value
        `,
      [ctx.activeUser.companyId],
    );
    return ResponseFormatter.success(
      roleSuccessMessages.fetchedRolesStats,
      stats.map(
        (stat: { count: number; value: string }) =>
          new GetStatsResponseDTO(stat),
      ),
    );
  }
}
