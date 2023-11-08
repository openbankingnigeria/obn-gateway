import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/common/database/entities';
import { Repository } from 'typeorm';
import {
  CreateRoleDto,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { IBadRequestException } from 'src/common/utils/exceptions/exceptions';
import { roleErrors } from 'src/common/constants/errors/role.errors';
import { ResponseFormatter } from 'src/common/utils/common/response.util';
import { RequestContextService } from 'src/common/utils/request/request-context.service';

@Injectable({ scope: Scope.REQUEST })
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly requestContext: RequestContextService,
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
        description,
        status,
      }),
    );

    return ResponseFormatter.success('', role);
  }

  async listRoles() {
    const roles = await this.roleRepository.find({});
    return ResponseFormatter.success('', roles);
  }

  async getRole(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
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
      where: { id },
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
      where: { id },
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
      where: { id },
      relations: { permissions: true },
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
    console.log({ id, permissions }, this.requestContext.user);
  }
}
