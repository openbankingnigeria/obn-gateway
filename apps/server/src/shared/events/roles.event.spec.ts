import { User } from '@common/database/entities';
import { UserBuilder } from '@test/utils/builders';
import {
  RoleEvent,
  RoleEvents,
  CreateRoleEvent,
  ListRolesEvent,
  UpdateRolesEvent,
  DeleteRolesEvent,
  GetRolePermissionsEvent,
  SetRolePermissionsEvent,
  GetPermissionsEvent,
} from './roles.event';
import { BaseEvent } from './base.event';

describe('Role Events', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = new UserBuilder({
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
    }).build();
  });

  describe('RoleEvents enum', () => {
    it('should define all role event types', () => {
      expect(RoleEvents.CREATE_ROLE).toBe('role.create');
      expect(RoleEvents.LIST_ROLE).toBe('role.view');
      expect(RoleEvents.UPDATE_ROLE).toBe('role.update');
      expect(RoleEvents.DELETE_ROLE).toBe('role.delete');
      expect(RoleEvents.GET_ROLE_PERMISSIONS).toBe('role.permissions.view');
      expect(RoleEvents.GET_PERMISSIONS).toBe('permissions.view');
      expect(RoleEvents.GET_STATS).toBe('role.stats.view');
      expect(RoleEvents.SET_ROLE_PERMISSIONS).toBe('role.permissions.update');
    });
  });

  describe('RoleEvent', () => {
    it('should create role event with all properties', () => {
      const metadata = { roleId: 'role-123', action: 'created' };
      const event = new RoleEvent('custom.role.event', mockUser, metadata);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe('custom.role.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create role event with default metadata', () => {
      const event = new RoleEvent('custom.role.event', mockUser);

      expect(event.name).toBe('custom.role.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should inherit from BaseEvent', () => {
      const event = new RoleEvent('test.event', mockUser);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event).toBeInstanceOf(RoleEvent);
    });
  });

  describe('CreateRoleEvent', () => {
    const mockCreateMetadata = {
      roleId: 'role-123',
      roleName: 'Test Role',
      permissions: ['read', 'write'],
    };

    it('should create role creation event with required properties', () => {
      const event = new CreateRoleEvent(mockUser, mockCreateMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.CREATE_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockCreateMetadata);
    });

    it('should create role creation event with minimal metadata', () => {
      const minimalMetadata = { roleId: 'new-role' };
      const event = new CreateRoleEvent(mockUser, minimalMetadata);

      expect(event.name).toBe(RoleEvents.CREATE_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(minimalMetadata);
      expect(event.metadata.roleId).toBe('new-role');
    });

    it('should ensure role details are present in metadata', () => {
      const metadata = { 
        roleId: 'role-456', 
        roleName: 'Admin Role',
        status: 'active' 
      };
      const event = new CreateRoleEvent(mockUser, metadata);

      expect(event.metadata.roleId).toBe('role-456');
      expect(event.metadata.roleName).toBe('Admin Role');
      expect(event.metadata.status).toBe('active');
    });
  });

  describe('ListRolesEvent', () => {
    const mockListMetadata = { 
      filters: { status: 'active' },
      pagination: { page: 1, limit: 10 }
    };

    it('should create list roles event with required properties', () => {
      const event = new ListRolesEvent(mockUser, mockListMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.LIST_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockListMetadata);
    });

    it('should create list roles event with empty metadata', () => {
      const event = new ListRolesEvent(mockUser, {});

      expect(event.name).toBe(RoleEvents.LIST_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should handle pagination and filter metadata', () => {
      const metadata = {
        filters: { companyId: 'company-123', status: 'inactive' },
        pagination: { page: 2, limit: 25 },
        sortBy: 'createdAt'
      };
      const event = new ListRolesEvent(mockUser, metadata);

      expect(event.metadata.filters.companyId).toBe('company-123');
      expect(event.metadata.pagination.page).toBe(2);
      expect(event.metadata.sortBy).toBe('createdAt');
    });
  });

  describe('UpdateRolesEvent', () => {
    const mockUpdateMetadata = {
      roleId: 'role-123',
      changes: { description: 'Updated description', status: 'inactive' }
    };

    it('should create update role event with required properties', () => {
      const event = new UpdateRolesEvent(mockUser, mockUpdateMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.UPDATE_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockUpdateMetadata);
    });

    it('should create update role event with change tracking', () => {
      const metadata = {
        roleId: 'role-456',
        previousValues: { status: 'active' },
        newValues: { status: 'inactive' }
      };
      const event = new UpdateRolesEvent(mockUser, metadata);

      expect(event.metadata.roleId).toBe('role-456');
      expect(event.metadata.previousValues.status).toBe('active');
      expect(event.metadata.newValues.status).toBe('inactive');
    });

    it('should handle partial updates in metadata', () => {
      const event = new UpdateRolesEvent(mockUser, { roleId: 'role-789' });

      expect(event.metadata.roleId).toBe('role-789');
    });
  });

  describe('DeleteRolesEvent', () => {
    const mockDeleteMetadata = {
      roleId: 'role-123',
      roleName: 'Test Role',
      deletedAt: new Date().toISOString()
    };

    it('should create delete role event with required properties', () => {
      const event = new DeleteRolesEvent(mockUser, mockDeleteMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.DELETE_ROLE);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockDeleteMetadata);
    });

    it('should create delete role event with minimal metadata', () => {
      const event = new DeleteRolesEvent(mockUser, { roleId: 'role-to-delete' });

      expect(event.name).toBe(RoleEvents.DELETE_ROLE);
      expect(event.metadata.roleId).toBe('role-to-delete');
    });

    it('should preserve deletion context in metadata', () => {
      const metadata = {
        roleId: 'role-999',
        reason: 'Cleanup',
        cascadeDelete: true
      };
      const event = new DeleteRolesEvent(mockUser, metadata);

      expect(event.metadata.reason).toBe('Cleanup');
      expect(event.metadata.cascadeDelete).toBe(true);
    });
  });

  describe('GetRolePermissionsEvent', () => {
    const mockPermissionsMetadata = {
      roleId: 'role-123',
      permissionCount: 5
    };

    it('should create get role permissions event with required properties', () => {
      const event = new GetRolePermissionsEvent(mockUser, mockPermissionsMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.GET_ROLE_PERMISSIONS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockPermissionsMetadata);
    });

    it('should handle role permission query metadata', () => {
      const metadata = {
        roleId: 'role-456',
        includeInherited: true,
        filterBy: 'active'
      };
      const event = new GetRolePermissionsEvent(mockUser, metadata);

      expect(event.metadata.includeInherited).toBe(true);
      expect(event.metadata.filterBy).toBe('active');
    });
  });

  describe('SetRolePermissionsEvent', () => {
    const mockSetPermissionsMetadata = {
      roleId: 'role-123',
      addedPermissions: ['read', 'write'],
      removedPermissions: ['delete']
    };

    it('should create set role permissions event with required properties', () => {
      const event = new SetRolePermissionsEvent(mockUser, mockSetPermissionsMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.SET_ROLE_PERMISSIONS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockSetPermissionsMetadata);
    });

    it('should track permission changes in metadata', () => {
      const metadata = {
        roleId: 'role-789',
        previousPermissions: ['read'],
        newPermissions: ['read', 'write', 'execute'],
        operationType: 'bulk_update'
      };
      const event = new SetRolePermissionsEvent(mockUser, metadata);

      expect(event.metadata.previousPermissions).toEqual(['read']);
      expect(event.metadata.newPermissions).toEqual(['read', 'write', 'execute']);
      expect(event.metadata.operationType).toBe('bulk_update');
    });
  });

  describe('GetPermissionsEvent', () => {
    const mockGetPermissionsMetadata = {
      totalPermissions: 15,
      filteredCount: 10
    };

    it('should create get permissions event with required properties', () => {
      const event = new GetPermissionsEvent(mockUser, mockGetPermissionsMetadata);

      expect(event).toBeInstanceOf(RoleEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(RoleEvents.GET_PERMISSIONS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockGetPermissionsMetadata);
    });

    it('should handle permission listing metadata', () => {
      const metadata = {
        scope: 'company',
        categories: ['user', 'role', 'system'],
        includeSystem: false
      };
      const event = new GetPermissionsEvent(mockUser, metadata);

      expect(event.metadata.scope).toBe('company');
      expect(event.metadata.categories).toEqual(['user', 'role', 'system']);
      expect(event.metadata.includeSystem).toBe(false);
    });
  });

  describe('Event inheritance and polymorphism', () => {
    it('should allow treating all events as RoleEvent instances', () => {
      const events = [
        new CreateRoleEvent(mockUser, { roleId: 'role-1' }),
        new ListRolesEvent(mockUser, { filters: {} }),
        new UpdateRolesEvent(mockUser, { roleId: 'role-2' }),
        new DeleteRolesEvent(mockUser, { roleId: 'role-3' }),
        new GetRolePermissionsEvent(mockUser, { roleId: 'role-4' }),
        new SetRolePermissionsEvent(mockUser, { roleId: 'role-5' }),
        new GetPermissionsEvent(mockUser, { scope: 'all' }),
      ];

      events.forEach((event) => {
        expect(event).toBeInstanceOf(RoleEvent);
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(typeof event.name).toBe('string');
        expect(event.metadata).toBeDefined();
      });
    });

    it('should allow treating all events as BaseEvent instances', () => {
      const events = [
        new RoleEvent('custom.event', mockUser),
        new CreateRoleEvent(mockUser, { roleId: 'role-1' }),
        new ListRolesEvent(mockUser, {}),
      ];

      events.forEach((event) => {
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(event.name).toBeDefined();
      });
    });
  });

  describe('Event metadata handling', () => {
    it('should preserve metadata structure for complex objects', () => {
      const complexMetadata = {
        role: { id: 'role-123', name: 'Admin', status: 'active' },
        permissions: {
          added: ['create', 'read'],
          removed: ['delete'],
          total: 10
        },
        audit: {
          timestamp: Date.now(),
          ipAddress: '127.0.0.1',
          userAgent: 'Browser/1.0'
        },
        flags: { isSystemRole: false, requiresApproval: true },
      };

      const event = new CreateRoleEvent(mockUser, complexMetadata);

      expect(event.metadata).toEqual(complexMetadata);
      expect(event.metadata.role.id).toBe('role-123');
      expect(event.metadata.permissions.added).toEqual(['create', 'read']);
      expect(event.metadata.flags.isSystemRole).toBe(false);
    });

    it('should handle null and undefined metadata gracefully', () => {
      const event1 = new CreateRoleEvent(mockUser, null as any);
      const event2 = new CreateRoleEvent(mockUser, undefined as any);

      expect(event1.metadata).toBeNull();
      expect(event2.metadata).toBeUndefined();
    });
  });

  describe('User property consistency', () => {
    it('should maintain user reference across different event types', () => {
      const createEvent = new CreateRoleEvent(mockUser, { roleId: 'role-1' });
      const updateEvent = new UpdateRolesEvent(mockUser, { roleId: 'role-2' });
      const deleteEvent = new DeleteRolesEvent(mockUser, { roleId: 'role-3' });

      expect(createEvent.author).toBe(mockUser);
      expect(updateEvent.author).toBe(mockUser);
      expect(deleteEvent.author).toBe(mockUser);
    });

    it('should handle different user instances correctly', () => {
      const user1 = new UserBuilder().with('id', 'user-1').build();
      const user2 = new UserBuilder().with('id', 'user-2').build();

      const event1 = new CreateRoleEvent(user1, { roleId: 'role-1' });
      const event2 = new CreateRoleEvent(user2, { roleId: 'role-2' });

      expect(event1.author).toBe(user1);
      expect(event2.author).toBe(user2);
      expect(event1.author).not.toBe(event2.author);
    });
  });
});