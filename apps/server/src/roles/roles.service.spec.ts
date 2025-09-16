import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import {
  Role,
  Permission,
  RolePermission,
  RoleStatuses,
  User,
  Company,
  CompanyStatuses,
  UserStatuses,
} from '@common/database/entities';
import {
  RoleBuilder,
  PermissionBuilder,
  RolePermissionBuilder,
  UserBuilder,
  CompanyBuilder,
} from '@test/utils/builders';
import {
  createMockRepository,
  MockRepository,
  mockEventEmitter,
} from '@test/utils/mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  CreateRoleDto,
  UpdateRoleDto,
  SetRolePermissionsDto,
} from './dto/index.dto';
import {
  IBadRequestException,
  IForbiddenException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { roleSuccessMessages } from '@roles/role.constants';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { PERMISSIONS } from '@permissions/types';
import {
  CreateRoleEvent,
  DeleteRolesEvent,
  GetRolePermissionsEvent,
  ListRolesEvent,
  SetRolePermissionsEvent,
  UpdateRolesEvent,
} from '@shared/events/roles.event';
import { Equal, In, IsNull, Not } from 'typeorm';
import slugify from 'slugify';

jest.mock('slugify');
const mockedSlugify = slugify as jest.MockedFunction<typeof slugify>;

describe('RolesService (merged test suite)', () => {
  let service: RolesService;
  let roleRepository: MockRepository<Role>;
  let permissionRepository: MockRepository<Permission>;
  let rolePermissionRepository: MockRepository<RolePermission>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  let mockUser: User;
  let mockCompany: Company;
  let mockRole: Role;
  let mockParentRole: Role;
  let mockPermission: Permission;
  let mockRolePermission: RolePermission;
  let mockRequestContext: RequestContext;

  beforeEach(async () => {
    roleRepository = createMockRepository<Role>();
    permissionRepository = createMockRepository<Permission>();
    rolePermissionRepository = createMockRepository<RolePermission>();
    rolePermissionRepository.insert = jest.fn();
    rolePermissionRepository.delete = jest.fn();
    roleRepository.softDelete = jest.fn();

    eventEmitter = mockEventEmitter();

    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('status', CompanyStatuses.ACTIVE)
      .build();

    mockParentRole = new RoleBuilder()
      .with('id', 'parent-role-id')
      .with('name', 'Parent Role')
      .with('slug', 'parent-role')
      .with('status', RoleStatuses.ACTIVE)
      .build();

    mockRole = new RoleBuilder()
      .with('id', 'role-id')
      .with('name', 'Test Role')
      .with('slug', 'test-role')
      .with('description', 'Test role description')
      .with('status', RoleStatuses.ACTIVE)
      .with('parentId', mockParentRole.id!)
      .with('companyId', mockCompany.id!)
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('companyId', mockCompany.id!)
      .with('company', mockCompany)
      .with('role', mockParentRole)
      .build();

    mockPermission = new PermissionBuilder()
      .with('id', 'permission-id')
      .with('name', 'Test Permission')
      .with('slug', 'test-permission')
      .build();

    mockRolePermission = new RolePermissionBuilder()
      .with('id', 'role-permission-id')
      .with('roleId', mockRole.id!)
      .with('permissionId', mockPermission.id!)
      .build();

    mockRequestContext = {
      activeUser: mockUser,
      hasPermission: jest.fn(),
    } as any;

    mockedSlugify.mockReturnValue('test-role');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: 'RoleRepository', useValue: roleRepository },
        { provide: 'PermissionRepository', useValue: permissionRepository },
        {
          provide: 'RolePermissionRepository',
          useValue: rolePermissionRepository,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    const createRoleDto: CreateRoleDto = {
      name: 'New Role',
      description: 'New role description',
      status: RoleStatuses.ACTIVE,
      permissions: ['permission-id'],
    };

    it('should create role, assign permissions, and emit event', async () => {
      roleRepository.count.mockResolvedValue(0);
      permissionRepository.find.mockResolvedValue([mockPermission]);
      roleRepository.create.mockReturnValue({
        ...mockRole,
        name: createRoleDto.name,
        slug: 'test-role',
        description: createRoleDto.description,
        status: createRoleDto.status,
      } as Role);
      roleRepository.save.mockResolvedValue(mockRole);
      rolePermissionRepository.insert.mockResolvedValue({} as any);

      const result = await service.createRole(
        mockRequestContext,
        createRoleDto,
      );

      expect(mockedSlugify).toHaveBeenCalledTimes(1);
      expect(mockedSlugify).toHaveBeenCalledWith(createRoleDto.name, {
        lower: true,
        strict: true,
      });
      expect(roleRepository.count).toHaveBeenCalledTimes(1);
      expect(roleRepository.count).toHaveBeenCalledWith({
        where: {
          name: Equal(createRoleDto.name),
          companyId: Equal(mockUser.companyId),
        },
      });
      expect(roleRepository.save).toHaveBeenCalled();
      expect(rolePermissionRepository.insert).toHaveBeenCalledTimes(1);
      expect(rolePermissionRepository.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          { roleId: mockRole.id, permissionId: 'permission-id' },
        ]),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(CreateRoleEvent),
      );
      expect(result).toEqual(
        ResponseFormatter.success(
          roleSuccessMessages.createdRole,
          expect.any(Object),
        ),
      );
    });

    it('should throw when name already exists in company', async () => {
      roleRepository.count.mockResolvedValue(1);
      await expect(
        service.createRole(mockRequestContext, createRoleDto),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw when requested permission does not exist for parent', async () => {
      roleRepository.count.mockResolvedValue(0);
      permissionRepository.find.mockResolvedValue([]);
      await expect(
        service.createRole(mockRequestContext, createRoleDto),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should propagate error if permission insert fails (documents atomicity)', async () => {
      roleRepository.count.mockResolvedValue(0);
      permissionRepository.find.mockResolvedValue([mockPermission]);
      roleRepository.create.mockReturnValue(mockRole);
      roleRepository.save.mockResolvedValue(mockRole);
      rolePermissionRepository.insert.mockRejectedValue(
        new Error('insert failed'),
      );

      await expect(
        service.createRole(mockRequestContext, createRoleDto),
      ).rejects.toThrow('insert failed');
      expect(roleRepository.save).toHaveBeenCalled();
    });

    it('should derive slug via slugify', async () => {
      roleRepository.count.mockResolvedValue(0);
      permissionRepository.find.mockResolvedValue([mockPermission]);
      roleRepository.create.mockImplementation((r: any) => r);
      roleRepository.save.mockResolvedValue({ ...mockRole, slug: 'test-role' });
      await service.createRole(mockRequestContext, createRoleDto);
      expect(mockedSlugify).toHaveBeenCalledTimes(1);
    });
  });

  describe('listRoles', () => {
    const paginationParams: PaginationParameters = { page: 1, limit: 10 };

    it('should return tenant + default roles with pagination meta and emit event', async () => {
      const roles = [mockRole];
      roleRepository.count.mockResolvedValue(1);
      roleRepository.find.mockResolvedValue(roles);

      const result = await service.listRoles(
        mockRequestContext,
        paginationParams,
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta).toMatchObject({
        totalNumberOfRecords: 1,
        totalNumberOfPages: 1,
        pageNumber: 1,
        pageSize: 10,
      });
      expect(roleRepository.find).toHaveBeenCalledTimes(1);
      expect(roleRepository.find).toHaveBeenCalledWith({
        where: expect.arrayContaining([
          expect.objectContaining({
            parentId: Equal(mockUser.role.parentId),
            companyId: Equal(mockUser.companyId),
            deletedAt: IsNull(),
          }),
          expect.objectContaining({
            parentId: Equal(mockUser.role.parentId),
            companyId: IsNull(),
            deletedAt: IsNull(),
          }),
        ]),
        skip: 0,
        take: 10,
        order: { createdAt: 'DESC' },
      });
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(ListRolesEvent),
      );
    });

    it('should apply filters to both branches', async () => {
      roleRepository.count.mockResolvedValue(0);
      roleRepository.find.mockResolvedValue([]);
      await service.listRoles(mockRequestContext, paginationParams, {
        status: RoleStatuses.ACTIVE,
      });
      expect(roleRepository.find).toHaveBeenCalled();
    });
  });

  describe('getRole', () => {
    it('should return role when found in tenant/default scope', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      const result = await service.getRole(mockRequestContext, mockRole.id!);
      expect(result).toEqual(
        ResponseFormatter.success(
          roleSuccessMessages.fetchedRole,
          expect.any(Object),
        ),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(ListRolesEvent),
      );
    });

    it('should throw when not found (cross-tenant/soft-deleted)', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.getRole(mockRequestContext, 'missing'),
      ).rejects.toThrow(INotFoundException);
    });
  });

  describe('updateRole', () => {
    const updateRoleDto: UpdateRoleDto = {
      description: 'Updated',
      status: RoleStatuses.INACTIVE,
    };

    it('should update description/status and emit event', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      roleRepository.create.mockReturnValue(updateRoleDto as any);
      roleRepository.update.mockResolvedValue({ affected: 1 } as any);
      (mockRequestContext.hasPermission as jest.Mock).mockReturnValue(true);

      const result = await service.updateRole(
        mockRequestContext,
        mockRole.id!,
        updateRoleDto,
      );

      expect(result).toEqual(
        ResponseFormatter.success(
          roleSuccessMessages.updatedRole,
          expect.any(Object),
        ),
      );
      expect(roleRepository.update).toHaveBeenCalledTimes(1);
      expect(roleRepository.update).toHaveBeenCalledWith(
        { id: mockRole.id },
        updateRoleDto,
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(UpdateRolesEvent),
      );
    });

    it('should throw when role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.updateRole(mockRequestContext, 'missing', updateRoleDto),
      ).rejects.toThrow(INotFoundException);
    });

    it('should throw when updating default role', async () => {
      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        companyId: null as any,
      });
      await expect(
        service.updateRole(mockRequestContext, mockRole.id!, updateRoleDto),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should throw when role belongs to another company', async () => {
      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        companyId: 'other',
      });
      await expect(
        service.updateRole(mockRequestContext, mockRole.id!, updateRoleDto),
      ).rejects.toThrow(INotFoundException);
    });

    it('should require ACTIVATE_ROLE to move to ACTIVE', async () => {
      const inactive = { ...mockRole, status: RoleStatuses.INACTIVE };
      roleRepository.findOne.mockResolvedValue(inactive);
      (mockRequestContext.hasPermission as jest.Mock).mockReturnValue(false);
      await expect(
        service.updateRole(mockRequestContext, mockRole.id!, {
          description: 'test',
          status: RoleStatuses.ACTIVE,
        }),
      ).rejects.toThrow(IForbiddenException);
      expect(mockRequestContext.hasPermission).toHaveBeenCalledTimes(1);
      expect(mockRequestContext.hasPermission).toHaveBeenCalledWith(
        PERMISSIONS.ACTIVATE_ROLE,
      );
    });

    it('should require DEACTIVATE_ROLE to move to INACTIVE', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      (mockRequestContext.hasPermission as jest.Mock).mockReturnValue(false);
      await expect(
        service.updateRole(mockRequestContext, mockRole.id!, {
          description: 'test',
          status: RoleStatuses.INACTIVE,
        }),
      ).rejects.toThrow(IForbiddenException);
      expect(mockRequestContext.hasPermission).toHaveBeenCalledTimes(1);
      expect(mockRequestContext.hasPermission).toHaveBeenCalledWith(
        PERMISSIONS.DEACTIVATE_ROLE,
      );
    });

    it('should not require permissions when status unchanged (no-op)', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      roleRepository.create.mockReturnValue({
        description: 'same',
        status: mockRole.status!,
      } as any);
      roleRepository.update.mockResolvedValue({ affected: 1 } as any);
      (mockRequestContext.hasPermission as jest.Mock).mockReturnValue(false);

      await expect(
        service.updateRole(mockRequestContext, mockRole.id!, {
          description: 'same',
          status: mockRole.status!,
        }),
      ).resolves.toBeDefined();

      expect(mockRequestContext.hasPermission).not.toHaveBeenCalled();
    });
  });

  describe('deleteRole', () => {
    it('should soft delete tenant role and emit event', async () => {
      roleRepository.findOne.mockResolvedValue(mockRole);
      roleRepository.softDelete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteRole(mockRequestContext, mockRole.id!);

      expect(result).toEqual(
        ResponseFormatter.success(roleSuccessMessages.deletedRole),
      );
      expect(roleRepository.softDelete).toHaveBeenCalledTimes(1);
      expect(roleRepository.softDelete).toHaveBeenCalledWith({
        id: mockRole.id,
      });
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(DeleteRolesEvent),
      );
    });

    it('should throw when role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.deleteRole(mockRequestContext, 'missing'),
      ).rejects.toThrow(INotFoundException);
    });

    it('should return not found when attempting to delete default role (by where clause)', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.deleteRole(mockRequestContext, 'default-role-id'),
      ).rejects.toThrow(INotFoundException);
    });
  });

  describe('getRolePermissions', () => {
    it('should return permissions for tenant/default role and emit event', async () => {
      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        permissions: [mockPermission],
      });
      const result = await service.getRolePermissions(
        mockRequestContext,
        mockRole.id!,
      );
      expect(result.data).toHaveLength(1);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(GetRolePermissionsEvent),
      );
    });

    it('should throw when role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.getRolePermissions(mockRequestContext, 'missing'),
      ).rejects.toThrow(INotFoundException);
    });
  });

  describe('setRolePermissions', () => {
    const setPermissionsDto: SetRolePermissionsDto = {
      permissions: ['permission-id', 'new-permission-id'],
    };

    it('should insert only new, delete removed, and emit event', async () => {
      const newPermission = new PermissionBuilder()
        .with('id', 'new-permission-id')
        .with('name', 'New Permission')
        .with('slug', 'new-permission')
        .build();

      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        rolePermissions: [mockRolePermission],
      });
      permissionRepository.find.mockResolvedValue([
        mockPermission,
        newPermission,
      ]);
      rolePermissionRepository.delete.mockResolvedValue({ affected: 0 } as any);
      rolePermissionRepository.insert.mockResolvedValue({} as any);

      const result = await service.setRolePermissions(
        mockRequestContext,
        mockRole.id!,
        setPermissionsDto.permissions,
      );

      expect(result).toEqual(
        ResponseFormatter.success(roleSuccessMessages.updatedRole),
      );
      expect(rolePermissionRepository.delete).toHaveBeenCalledTimes(1);
      expect(rolePermissionRepository.delete).toHaveBeenCalledWith({
        permissionId: Not(In(setPermissionsDto.permissions)),
        roleId: mockRole.id,
      });
      // only the new permission should be inserted
      expect(rolePermissionRepository.insert).toHaveBeenCalledTimes(1);
      expect(rolePermissionRepository.insert).toHaveBeenCalledWith(
        expect.arrayContaining([
          { roleId: mockRole.id, permissionId: 'new-permission-id' },
        ]),
      );
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(SetRolePermissionsEvent),
      );
    });

    it('should be idempotent when called with same set twice', async () => {
      // First call: role has one permission, we add a new one
      roleRepository.findOne
        .mockResolvedValueOnce({
          ...mockRole,
          rolePermissions: [mockRolePermission],
        })
        // Second call: role now has both permissions, no new ones to add
        .mockResolvedValueOnce({
          ...mockRole,
          rolePermissions: [
            mockRolePermission,
            {
              ...mockRolePermission,
              id: 'rp-2',
              permissionId: 'new-permission-id',
            },
          ],
        });

      permissionRepository.find.mockResolvedValue([
        mockPermission,
        { ...mockPermission, id: 'new-permission-id', slug: 'new' },
      ]);

      rolePermissionRepository.delete.mockResolvedValue({ affected: 0 } as any);
      rolePermissionRepository.insert.mockResolvedValue({} as any);

      await service.setRolePermissions(mockRequestContext, mockRole.id!, [
        'permission-id',
        'new-permission-id',
      ]);
      
      rolePermissionRepository.insert.mockClear();
      
      await service.setRolePermissions(mockRequestContext, mockRole.id!, [
        'permission-id',
        'new-permission-id',
      ]);
      expect(rolePermissionRepository.insert).toHaveBeenCalledTimes(1);
      expect(rolePermissionRepository.insert).toHaveBeenCalledWith([]);
    });

    it('should throw when role not found', async () => {
      roleRepository.findOne.mockResolvedValue(null);
      await expect(
        service.setRolePermissions(
          mockRequestContext,
          'missing',
          setPermissionsDto.permissions,
        ),
      ).rejects.toThrow(INotFoundException);
    });

    it('should throw when any permission is not available to parent', async () => {
      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        rolePermissions: [],
      });
      permissionRepository.find.mockResolvedValue([]);
      await expect(
        service.setRolePermissions(
          mockRequestContext,
          mockRole.id!,
          setPermissionsDto.permissions,
        ),
      ).rejects.toThrow(IBadRequestException);
    });

    it('should document partial state if failure occurs after delete and before insert', async () => {
      roleRepository.findOne.mockResolvedValue({
        ...mockRole,
        rolePermissions: [mockRolePermission],
      });
      permissionRepository.find.mockResolvedValue([
        mockPermission,
        { ...mockPermission, id: 'new-permission-id', slug: 'new' },
      ]);
      rolePermissionRepository.delete.mockResolvedValue({ affected: 1 } as any);
      rolePermissionRepository.insert.mockRejectedValue(
        new Error('insert failed'),
      );

      await expect(
        service.setRolePermissions(mockRequestContext, mockRole.id!, [
          'permission-id',
          'new-permission-id',
        ]),
      ).rejects.toThrow('insert failed');

      expect(rolePermissionRepository.delete).toHaveBeenCalled();
    });
  });

  describe('getPermissions', () => {
    it('should return only permissions scoped to ctx parentId', async () => {
      permissionRepository.find.mockResolvedValue([mockPermission]);
      const result = await service.getPermissions(mockRequestContext);
      expect(result.data).toHaveLength(1);
      expect(permissionRepository.find).toHaveBeenCalledTimes(1);
      expect(permissionRepository.find).toHaveBeenCalledWith({
        where: { roles: { roleId: Equal(mockUser.role.parentId) } },
      });
    });
  });

  describe('getStats', () => {
    it('should map raw counts to DTOs', async () => {
      const mockStats = [
        { count: 5, value: RoleStatuses.ACTIVE },
        { count: 0, value: RoleStatuses.INACTIVE },
      ];
      roleRepository.query.mockResolvedValue(mockStats);

      const result = await service.getStats(mockRequestContext);

      expect(result.data).toHaveLength(2);
      expect(roleRepository.query).toHaveBeenCalledTimes(1);
      expect(roleRepository.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [mockUser.companyId],
      );
    });
  });
});
