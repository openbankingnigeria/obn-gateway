import { User } from '@common/database/entities';
import { UserBuilder } from '@test/utils/builders';
import {
  SettingsEvent,
  SettingsEvents,
  UpdateKybRequirementsEvent,
  UpdateCompanySubtypesEvent,
  GetApiKeyEvent,
  GenerateApiKeyEvent,
  SetIPRestrictionEvent,
  EditSettingsEvent,
  SetClientEvent,
} from './settings.event';
import { BaseEvent } from './base.event';

describe('Settings Events', () => {
  let mockUser: User;

  beforeEach(() => {
    mockUser = new UserBuilder({
      id: 'user-id',
      email: 'test@example.com',
      password: 'hashed-password',
    }).build();
  });

  describe('SettingsEvents enum', () => {
    it('should define all settings event types', () => {
      expect(SettingsEvents.UPDATE_KYB_REQUIREMENTS).toBe('settings.kyb.update');
      expect(SettingsEvents.UPDATE_COMPANY_SUBTYPES).toBe('settings.company_types.update');
      expect(SettingsEvents.GET_API_KEY).toBe('settings.api.key.view');
      expect(SettingsEvents.GENERATE_API_KEY).toBe('settings.api.key.create');
      expect(SettingsEvents.SET_IP_RESTRICTIOIN).toBe('settings.api.restriction.create');
      expect(SettingsEvents.EDIT_SETTINGS).toBe('settings.update');
      expect(SettingsEvents.SET_CLIENT_EVENT).toBe('settings.api.client.create');
    });
  });

  describe('SettingsEvent', () => {
    it('should create settings event with all properties', () => {
      const metadata = { settingType: 'kyb', action: 'updated' };
      const event = new SettingsEvent('custom.settings.event', mockUser, metadata);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe('custom.settings.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(metadata);
    });

    it('should create settings event with default metadata', () => {
      const event = new SettingsEvent('custom.settings.event', mockUser);

      expect(event.name).toBe('custom.settings.event');
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should inherit from BaseEvent', () => {
      const event = new SettingsEvent('test.event', mockUser);

      expect(event).toBeInstanceOf(BaseEvent);
      expect(event).toBeInstanceOf(SettingsEvent);
    });
  });

  describe('UpdateKybRequirementsEvent', () => {
    const mockKybMetadata = {
      kybRequirements: [
        {
          name: 'taxIdentificationNumber',
          label: 'Tax ID',
          type: 'string',
          editable: false,
        },
      ],
      previousRequirements: [],
    };

    it('should create KYB requirements update event with required properties', () => {
      const event = new UpdateKybRequirementsEvent(mockUser, mockKybMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.UPDATE_KYB_REQUIREMENTS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockKybMetadata);
    });

    it('should create KYB requirements event with minimal metadata', () => {
      const minimalMetadata = { kybRequirements: [] };
      const event = new UpdateKybRequirementsEvent(mockUser, minimalMetadata);

      expect(event.name).toBe(SettingsEvents.UPDATE_KYB_REQUIREMENTS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(minimalMetadata);
      expect(event.metadata.kybRequirements).toEqual([]);
    });

    it('should ensure KYB details are present in metadata', () => {
      const metadata = {
        kybRequirements: [
          { name: 'companyLicense', type: 'file', maxCount: 1 },
        ],
        organizationId: 'org-123',
        updatedFields: ['taxIdentificationNumber'],
      };
      const event = new UpdateKybRequirementsEvent(mockUser, metadata);

      expect(event.metadata.kybRequirements).toHaveLength(1);
      expect(event.metadata.organizationId).toBe('org-123');
      expect(event.metadata.updatedFields).toEqual(['taxIdentificationNumber']);
    });
  });

  describe('UpdateCompanySubtypesEvent', () => {
    const mockSubtypesMetadata = {
      companySubtypes: {
        BUSINESS: [{ value: 'Technology', default: true }],
        LICENSED_ENTITY: [{ value: 'Commercial Bank', default: true }],
      },
    };

    it('should create company subtypes update event with required properties', () => {
      const event = new UpdateCompanySubtypesEvent(mockUser, mockSubtypesMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.UPDATE_COMPANY_SUBTYPES);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockSubtypesMetadata);
    });

    it('should create company subtypes event with empty metadata', () => {
      const event = new UpdateCompanySubtypesEvent(mockUser, {});

      expect(event.name).toBe(SettingsEvents.UPDATE_COMPANY_SUBTYPES);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual({});
    });

    it('should handle company type changes in metadata', () => {
      const metadata = {
        companySubtypes: { INDIVIDUAL: [] },
        previousSubtypes: { INDIVIDUAL: [{ value: 'Personal', default: true }] },
        changedTypes: ['INDIVIDUAL'],
      };
      const event = new UpdateCompanySubtypesEvent(mockUser, metadata);

      expect(event.metadata.companySubtypes.INDIVIDUAL).toEqual([]);
      expect(event.metadata.changedTypes).toEqual(['INDIVIDUAL']);
    });
  });

  describe('GetApiKeyEvent', () => {
    const mockApiKeyMetadata = {
      environment: 'production',
      organizationId: 'org-123',
    };

    it('should create get API key event with required properties', () => {
      const event = new GetApiKeyEvent(mockUser, mockApiKeyMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.GET_API_KEY);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockApiKeyMetadata);
    });

    it('should handle API key retrieval metadata', () => {
      const metadata = {
        environment: 'sandbox',
        keyStatus: 'active',
        lastUsed: '2023-12-01T10:00:00Z',
      };
      const event = new GetApiKeyEvent(mockUser, metadata);

      expect(event.metadata.environment).toBe('sandbox');
      expect(event.metadata.keyStatus).toBe('active');
      expect(event.metadata.lastUsed).toBe('2023-12-01T10:00:00Z');
    });
  });

  describe('GenerateApiKeyEvent', () => {
    const mockGenerateKeyMetadata = {
      environment: 'production',
      organizationId: 'org-123',
      previousKeyId: 'key-456',
    };

    it('should create generate API key event with required properties', () => {
      const event = new GenerateApiKeyEvent(mockUser, mockGenerateKeyMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.GENERATE_API_KEY);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockGenerateKeyMetadata);
    });

    it('should create generate API key event with key rotation metadata', () => {
      const metadata = {
        environment: 'sandbox',
        newKeyId: 'key-789',
        rotationReason: 'security_update',
        expiresAt: '2024-12-01T00:00:00Z',
      };
      const event = new GenerateApiKeyEvent(mockUser, metadata);

      expect(event.metadata.newKeyId).toBe('key-789');
      expect(event.metadata.rotationReason).toBe('security_update');
      expect(event.metadata.expiresAt).toBe('2024-12-01T00:00:00Z');
    });

    it('should handle minimal generation metadata', () => {
      const event = new GenerateApiKeyEvent(mockUser, { environment: 'development' });

      expect(event.metadata.environment).toBe('development');
    });
  });

  describe('SetIPRestrictionEvent', () => {
    const mockIPRestrictionMetadata = {
      environment: 'production',
      ipRestrictions: ['192.168.1.1', '10.0.0.1'],
      previousRestrictions: ['192.168.1.0/24'],
    };

    it('should create set IP restriction event with required properties', () => {
      const event = new SetIPRestrictionEvent(mockUser, mockIPRestrictionMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.SET_IP_RESTRICTIOIN);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockIPRestrictionMetadata);
    });

    it('should create IP restriction event with restriction changes', () => {
      const metadata = {
        environment: 'sandbox',
        addedIPs: ['203.0.113.1'],
        removedIPs: ['198.51.100.1'],
        totalRestrictions: 5,
      };
      const event = new SetIPRestrictionEvent(mockUser, metadata);

      expect(event.metadata.addedIPs).toEqual(['203.0.113.1']);
      expect(event.metadata.removedIPs).toEqual(['198.51.100.1']);
      expect(event.metadata.totalRestrictions).toBe(5);
    });

    it('should handle IP restriction clearing', () => {
      const metadata = {
        environment: 'production',
        ipRestrictions: [],
        action: 'clear_all',
      };
      const event = new SetIPRestrictionEvent(mockUser, metadata);

      expect(event.metadata.ipRestrictions).toEqual([]);
      expect(event.metadata.action).toBe('clear_all');
    });
  });

  describe('EditSettingsEvent', () => {
    const mockEditSettingsMetadata = {
      settingsType: 'business_settings',
      changes: { companyName: 'New Company Name' },
      previousValues: { companyName: 'Old Company Name' },
    };

    it('should create edit settings event with required properties', () => {
      const event = new EditSettingsEvent(mockUser, mockEditSettingsMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.EDIT_SETTINGS);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockEditSettingsMetadata);
    });

    it('should create edit settings event with change tracking', () => {
      const metadata = {
        settingsType: 'notification_settings',
        updatedFields: ['emailNotifications', 'smsAlerts'],
        operationType: 'bulk_update',
      };
      const event = new EditSettingsEvent(mockUser, metadata);

      expect(event.metadata.settingsType).toBe('notification_settings');
      expect(event.metadata.updatedFields).toEqual(['emailNotifications', 'smsAlerts']);
      expect(event.metadata.operationType).toBe('bulk_update');
    });

    it('should handle partial settings updates', () => {
      const event = new EditSettingsEvent(mockUser, { settingsType: 'user_preferences' });

      expect(event.metadata.settingsType).toBe('user_preferences');
    });
  });

  describe('SetClientEvent', () => {
    const mockClientMetadata = {
      environment: 'production',
      clientId: 'client-123',
      previousClientId: 'client-456',
    };

    it('should create set client event with required properties', () => {
      const event = new SetClientEvent(mockUser, mockClientMetadata);

      expect(event).toBeInstanceOf(SettingsEvent);
      expect(event).toBeInstanceOf(BaseEvent);
      expect(event.name).toBe(SettingsEvents.SET_CLIENT_EVENT);
      expect(event.author).toBe(mockUser);
      expect(event.metadata).toEqual(mockClientMetadata);
    });

    it('should create client event with configuration metadata', () => {
      const metadata = {
        environment: 'sandbox',
        clientId: 'client-789',
        clientType: 'web_application',
        scopes: ['read', 'write'],
      };
      const event = new SetClientEvent(mockUser, metadata);

      expect(event.metadata.clientType).toBe('web_application');
      expect(event.metadata.scopes).toEqual(['read', 'write']);
    });

    it('should preserve client context in metadata', () => {
      const metadata = {
        environment: 'development',
        clientId: 'client-dev-001',
        organizationId: 'org-456',
        isActive: true,
      };
      const event = new SetClientEvent(mockUser, metadata);

      expect(event.metadata.organizationId).toBe('org-456');
      expect(event.metadata.isActive).toBe(true);
    });
  });

  describe('Event inheritance and polymorphism', () => {
    it('should allow treating all events as SettingsEvent instances', () => {
      const events = [
        new UpdateKybRequirementsEvent(mockUser, { kybRequirements: [] }),
        new UpdateCompanySubtypesEvent(mockUser, { companySubtypes: {} }),
        new GetApiKeyEvent(mockUser, { environment: 'production' }),
        new GenerateApiKeyEvent(mockUser, { environment: 'sandbox' }),
        new SetIPRestrictionEvent(mockUser, { ipRestrictions: [] }),
        new EditSettingsEvent(mockUser, { settingsType: 'general' }),
        new SetClientEvent(mockUser, { clientId: 'client-123' }),
      ];

      events.forEach((event) => {
        expect(event).toBeInstanceOf(SettingsEvent);
        expect(event).toBeInstanceOf(BaseEvent);
        expect(event.author).toBe(mockUser);
        expect(typeof event.name).toBe('string');
        expect(event.metadata).toBeDefined();
      });
    });

    it('should allow treating all events as BaseEvent instances', () => {
      const events = [
        new SettingsEvent('custom.event', mockUser),
        new UpdateKybRequirementsEvent(mockUser, { kybRequirements: [] }),
        new GetApiKeyEvent(mockUser, { environment: 'production' }),
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
        settings: { type: 'kyb', version: '1.0', status: 'active' },
        requirements: {
          added: ['document1', 'document2'],
          removed: ['oldDocument'],
          total: 5,
        },
        audit: {
          timestamp: Date.now(),
          ipAddress: '127.0.0.1',
          userAgent: 'Browser/1.0',
        },
        flags: { isSystemSetting: false, requiresApproval: true },
      };

      const event = new UpdateKybRequirementsEvent(mockUser, complexMetadata);

      expect(event.metadata).toEqual(complexMetadata);
      expect(event.metadata.settings.type).toBe('kyb');
      expect(event.metadata.requirements.added).toEqual(['document1', 'document2']);
      expect(event.metadata.flags.isSystemSetting).toBe(false);
    });

    it('should handle null and undefined metadata gracefully', () => {
      const event1 = new UpdateKybRequirementsEvent(mockUser, null as any);
      const event2 = new UpdateKybRequirementsEvent(mockUser, undefined as any);

      expect(event1.metadata).toBeNull();
      expect(event2.metadata).toBeUndefined();
    });
  });

  describe('User property consistency', () => {
    it('should maintain user reference across different event types', () => {
      const kybEvent = new UpdateKybRequirementsEvent(mockUser, { kybRequirements: [] });
      const apiEvent = new GetApiKeyEvent(mockUser, { environment: 'production' });
      const clientEvent = new SetClientEvent(mockUser, { clientId: 'client-123' });

      expect(kybEvent.author).toBe(mockUser);
      expect(apiEvent.author).toBe(mockUser);
      expect(clientEvent.author).toBe(mockUser);
    });

    it('should handle different user instances correctly', () => {
      const user1 = new UserBuilder().with('id', 'user-1').build();
      const user2 = new UserBuilder().with('id', 'user-2').build();

      const event1 = new UpdateKybRequirementsEvent(user1, { kybRequirements: [] });
      const event2 = new UpdateKybRequirementsEvent(user2, { kybRequirements: [] });

      expect(event1.author).toBe(user1);
      expect(event2.author).toBe(user2);
      expect(event1.author).not.toBe(event2.author);
    });
  });

  describe('Environment-specific events', () => {
    it('should handle multiple environments for API-related events', () => {
      const prodEvent = new GetApiKeyEvent(mockUser, { environment: 'production' });
      const sandboxEvent = new GenerateApiKeyEvent(mockUser, { environment: 'sandbox' });
      const devEvent = new SetIPRestrictionEvent(mockUser, { environment: 'development' });

      expect(prodEvent.metadata.environment).toBe('production');
      expect(sandboxEvent.metadata.environment).toBe('sandbox');
      expect(devEvent.metadata.environment).toBe('development');
    });

    it('should support environment-specific metadata', () => {
      const environments = ['production', 'sandbox', 'development'];
      
      environments.forEach((env) => {
        const event = new SetClientEvent(mockUser, {
          environment: env,
          clientId: `client-${env}`,
          config: { debug: env !== 'production' },
        });

        expect(event.metadata.environment).toBe(env);
        expect(event.metadata.clientId).toBe(`client-${env}`);
        expect(event.metadata.config.debug).toBe(env !== 'production');
      });
    });
  });
});