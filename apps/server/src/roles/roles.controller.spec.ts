import { RoleStatuses } from '@common/database/entities';
import { REQUIRED_PERMISSION_METADATA_KEY } from '@common/utils/authentication/auth.decorator';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { Test, TestingModule } from '@nestjs/testing';
import { PERMISSIONS } from '@permissions/types';
import { roleSuccessMessages } from '@roles/role.constants';
import {
  PermissionBuilder,
  RoleBuilder,
  UserBuilder,
} from '@test/utils/builders';
import {
  CreateRoleDto,
  GetPermissionResponseDTO,
  GetRoleResponseDTO,
  GetStatsResponseDTO,
  SetRolePermissionsDto,
  UpdateRoleDto,
} from './dto/index.dto';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

describe('RolesController', () => {
  let controller: RolesController;
  let rolesService: jest.Mocked<RolesService>;

  let mockCreateRoleDto: CreateRoleDto;
  let mockUpdateRoleDto: UpdateRoleDto;
  let mockSetRolePermissionsDto: SetRolePermissionsDto;
  let mockRequestContext: RequestContext;
  let mockPaginationParams: PaginationParameters;

  beforeEach(async () => {
    rolesService = {
      createRole: jest.fn(),
      listRoles: jest.fn(),
      getRole: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      getRolePermissions: jest.fn(),
      setRolePermissions: jest.fn(),
      getPermissions: jest.fn(),
      getStats: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: rolesService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);

    const mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('companyId', 'company-id')
      .build();

    mockRequestContext = {
      activeUser: mockUser,
      hasPermission: jest.fn(),
    } as any;

    mockCreateRoleDto = {
      name: 'Test Role',
      description: 'Test role description',
      status: RoleStatuses.ACTIVE,
      permissions: ['permission-1', 'permission-2'],
    };

    mockUpdateRoleDto = {
      description: 'Updated description',
      status: RoleStatuses.INACTIVE,
    };

    mockSetRolePermissionsDto = {
      permissions: ['permission-1', 'permission-3'],
    };

    mockPaginationParams = {
      page: 1,
      limit: 10,
    };

    jest.clearAllMocks();
  });

  describe('createRole', () => {
    describe('when createRole is called with valid data', () => {
      it('should successfully create a role', async () => {
        const mockRole = new RoleBuilder()
          .with('id', 'role-id')
          .with('name', mockCreateRoleDto.name)
          .with('description', mockCreateRoleDto.description)
          .build();

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.createdRole,
          new GetRoleResponseDTO(mockRole),
        );

        rolesService.createRole.mockResolvedValue(mockResponse);

        const result = await controller.createRole(
          mockRequestContext,
          mockCreateRoleDto,
        );

        expect(rolesService.createRole).toHaveBeenCalledTimes(1);
        expect(rolesService.createRole).toHaveBeenCalledWith(
          mockRequestContext,
          mockCreateRoleDto,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require CREATE_ROLE permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.createRole,
        );
        expect(requiredPermission).toBe(PERMISSIONS.CREATE_ROLE);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to createRole endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const pipes = reflector.get('__pipes__', controller.createRole);
        expect(pipes).toBeDefined();
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Role creation failed');
        rolesService.createRole.mockRejectedValue(error);

        await expect(
          controller.createRole(mockRequestContext, mockCreateRoleDto),
        ).rejects.toThrow('Role creation failed');
        expect(rolesService.createRole).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('listRoles', () => {
    const mockFilters = { status: RoleStatuses.ACTIVE };

    describe('when listRoles is called with valid parameters', () => {
      it('should successfully list roles', async () => {
        const mockRoles = [
          new RoleBuilder().with('id', 'role-1').build(),
          new RoleBuilder().with('id', 'role-2').build(),
        ];

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.fetchedRole,
          mockRoles.map((role) => new GetRoleResponseDTO(role)),
          {
            totalNumberOfRecords: 2,
            totalNumberOfPages: 1,
            pageNumber: 1,
            pageSize: 10,
          },
        );

        rolesService.listRoles.mockResolvedValue(mockResponse);

        const result = await controller.listRoles(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );

        expect(rolesService.listRoles).toHaveBeenCalledTimes(1);
        expect(rolesService.listRoles).toHaveBeenCalledWith(
          mockRequestContext,
          mockPaginationParams,
          mockFilters,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require LIST_ROLES permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.listRoles,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_ROLES);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Failed to fetch roles');
        rolesService.listRoles.mockRejectedValue(error);

        await expect(
          controller.listRoles(
            mockRequestContext,
            mockPaginationParams,
            mockFilters,
          ),
        ).rejects.toThrow('Failed to fetch roles');
        expect(rolesService.listRoles).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getStats', () => {
    describe('when getStats is called', () => {
      it('should successfully get role statistics', async () => {
        const mockStats = [
          { count: 5, value: RoleStatuses.ACTIVE },
          { count: 2, value: RoleStatuses.INACTIVE },
        ];

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.fetchedRolesStats,
          mockStats.map((stat) => new GetStatsResponseDTO(stat)),
        );

        rolesService.getStats.mockResolvedValue(mockResponse);

        const result = await controller.getStats(mockRequestContext);

        expect(rolesService.getStats).toHaveBeenCalledTimes(1);
        expect(rolesService.getStats).toHaveBeenCalledWith(mockRequestContext);
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require LIST_ROLES permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getStats,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_ROLES);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Failed to fetch stats');
        rolesService.getStats.mockRejectedValue(error);

        await expect(controller.getStats(mockRequestContext)).rejects.toThrow(
          'Failed to fetch stats',
        );
        expect(rolesService.getStats).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getPermissions', () => {
    describe('when getPermissions is called', () => {
      it('should successfully get permissions', async () => {
        const mockPermissions = [
          new PermissionBuilder().with('id', 'perm-1').build(),
          new PermissionBuilder().with('id', 'perm-2').build(),
        ];

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.fetchedPermissions,
          mockPermissions.map((perm) => new GetPermissionResponseDTO(perm)),
        );

        rolesService.getPermissions.mockResolvedValue(mockResponse);

        const result = await controller.getPermissions(mockRequestContext);

        expect(rolesService.getPermissions).toHaveBeenCalledTimes(1);
        expect(rolesService.getPermissions).toHaveBeenCalledWith(
          mockRequestContext,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require LIST_ROLES permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getPermissions,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_ROLES);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Failed to fetch permissions');
        rolesService.getPermissions.mockRejectedValue(error);

        await expect(
          controller.getPermissions(mockRequestContext),
        ).rejects.toThrow('Failed to fetch permissions');
        expect(rolesService.getPermissions).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getRole', () => {
    const roleId = 'role-id';

    describe('when getRole is called with valid id', () => {
      it('should successfully get a role', async () => {
        const mockRole = new RoleBuilder().with('id', roleId).build();

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.fetchedRole,
          new GetRoleResponseDTO(mockRole),
        );

        rolesService.getRole.mockResolvedValue(mockResponse);

        const result = await controller.getRole(mockRequestContext, roleId);

        expect(rolesService.getRole).toHaveBeenCalledTimes(1);
        expect(rolesService.getRole).toHaveBeenCalledWith(
          mockRequestContext,
          roleId,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require LIST_ROLES permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getRole,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_ROLES);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Role not found');
        rolesService.getRole.mockRejectedValue(error);

        await expect(
          controller.getRole(mockRequestContext, roleId),
        ).rejects.toThrow('Role not found');
        expect(rolesService.getRole).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('updateRole', () => {
    const roleId = 'role-id';

    describe('when updateRole is called with valid data', () => {
      it('should successfully update a role', async () => {
        const mockRole = new RoleBuilder()
          .with('id', roleId)
          .with('description', mockUpdateRoleDto.description)
          .build();

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.updatedRole,
          new GetRoleResponseDTO(mockRole),
        );

        rolesService.updateRole.mockResolvedValue(mockResponse);

        const result = await controller.updateRole(
          mockRequestContext,
          roleId,
          mockUpdateRoleDto,
        );

        expect(rolesService.updateRole).toHaveBeenCalledTimes(1);
        expect(rolesService.updateRole).toHaveBeenCalledWith(
          mockRequestContext,
          roleId,
          mockUpdateRoleDto,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('error', () => {
      it('should throw error for non-existent role', async () => {
        const error = new Error('Role not found');
        rolesService.updateRole.mockRejectedValue(error);

        await expect(
          controller.updateRole(
            mockRequestContext,
            'invalid-id',
            mockUpdateRoleDto,
          ),
        ).rejects.toThrow('Role not found');
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_ROLE permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.updateRole,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_ROLE);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Update failed');
        rolesService.updateRole.mockRejectedValue(error);

        await expect(
          controller.updateRole(mockRequestContext, roleId, mockUpdateRoleDto),
        ).rejects.toThrow('Update failed');
        expect(rolesService.updateRole).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('deleteRole', () => {
    const roleId = 'role-id';

    describe('when deleteRole is called with valid id', () => {
      it('should successfully delete a role', async () => {
        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.deletedRole,
        );

        rolesService.deleteRole.mockResolvedValue(mockResponse);

        const result = await controller.deleteRole(mockRequestContext, roleId);

        expect(rolesService.deleteRole).toHaveBeenCalledTimes(1);
        expect(rolesService.deleteRole).toHaveBeenCalledWith(
          mockRequestContext,
          roleId,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require DELETE_ROLE permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.deleteRole,
        );
        expect(requiredPermission).toBe(PERMISSIONS.DELETE_ROLE);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Deletion failed');
        rolesService.deleteRole.mockRejectedValue(error);

        await expect(
          controller.deleteRole(mockRequestContext, roleId),
        ).rejects.toThrow('Deletion failed');
        expect(rolesService.deleteRole).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('getRolePermissions', () => {
    const roleId = 'role-id';

    describe('when getRolePermissions is called with valid id', () => {
      it('should successfully get role permissions', async () => {
        const mockPermissions = [
          new PermissionBuilder().with('id', 'perm-1').build(),
          new PermissionBuilder().with('id', 'perm-2').build(),
        ];

        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.fetchedRole,
          mockPermissions.map((perm) => new GetPermissionResponseDTO(perm)),
        );

        rolesService.getRolePermissions.mockResolvedValue(mockResponse);

        const result = await controller.getRolePermissions(
          mockRequestContext,
          roleId,
        );

        expect(rolesService.getRolePermissions).toHaveBeenCalledTimes(1);
        expect(rolesService.getRolePermissions).toHaveBeenCalledWith(
          mockRequestContext,
          roleId,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require LIST_ROLES permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getRolePermissions,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_ROLES);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Failed to fetch role permissions');
        rolesService.getRolePermissions.mockRejectedValue(error);

        await expect(
          controller.getRolePermissions(mockRequestContext, roleId),
        ).rejects.toThrow('Failed to fetch role permissions');
        expect(rolesService.getRolePermissions).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('setRolePermissions', () => {
    const roleId = 'role-id';

    describe('when setRolePermissions is called with valid data', () => {
      it('should successfully set role permissions', async () => {
        const mockResponse = ResponseFormatter.success(
          roleSuccessMessages.updatedRole,
        );

        rolesService.setRolePermissions.mockResolvedValue(mockResponse);

        const result = await controller.setRolePermissions(
          mockRequestContext,
          roleId,
          mockSetRolePermissionsDto,
        );

        expect(rolesService.setRolePermissions).toHaveBeenCalledTimes(1);
        expect(rolesService.setRolePermissions).toHaveBeenCalledWith(
          mockRequestContext,
          roleId,
          mockSetRolePermissionsDto.permissions,
        );
        expect(result).toEqual(mockResponse);
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_ROLE permission', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.setRolePermissions,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_ROLE);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to setRolePermissions endpoint', () => {
        const { Reflector } = require('@nestjs/core');
        const reflector = new Reflector();

        const pipes = reflector.get('__pipes__', controller.setRolePermissions);
        expect(pipes).toBeDefined();
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from roles service', async () => {
        const error = new Error('Failed to set permissions');
        rolesService.setRolePermissions.mockRejectedValue(error);

        await expect(
          controller.setRolePermissions(
            mockRequestContext,
            roleId,
            mockSetRolePermissionsDto,
          ),
        ).rejects.toThrow('Failed to set permissions');
        expect(rolesService.setRolePermissions).toHaveBeenCalledTimes(1);
      });
    });
  });
});
