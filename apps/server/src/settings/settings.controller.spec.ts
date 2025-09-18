import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { RequestContext } from '@common/utils/request/request-context';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { SETTINGS_TYPES } from './types';
import { PERMISSIONS } from '@permissions/types';
import { REQUIRED_PERMISSION_METADATA_KEY } from '@common/utils/authentication/auth.decorator';
import {
  IPRestrictionRequest,
  UpdateCompanySubtypesRequest,
  UpdateKybRequirementsDto,
  ClientRequest,
} from './dto/index.dto';

const moduleMocker = new ModuleMocker(global);

describe('SettingsController', () => {
  let controller: SettingsController;
  let settingsService: jest.Mocked<SettingsService>;
  let reflector: Reflector;

  const mockRequestContext: RequestContext = {
    organizationId: 'test-org-id',
    userId: 'test-user-id',
    userEmail: 'test@example.com',
    permissions: [],
  } as RequestContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<SettingsController>(SettingsController);
    settingsService = module.get(SettingsService);
    reflector = new Reflector();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getKybRequirements', () => {
    describe('when called', () => {
      it('should call settingsService.getKybRequirements', async () => {
        const mockResult = { requirements: [] };
        settingsService.getKybRequirements.mockResolvedValue(mockResult);

        const result = await controller.getKybRequirements();

        expect(settingsService.getKybRequirements).toHaveBeenCalledWith();
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.getKybRequirements.mockRejectedValue(error);

        await expect(controller.getKybRequirements()).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require VIEW_KYB_REQUIREMENTS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getKybRequirements,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_KYB_REQUIREMENTS);
      });
    });
  });

  describe('updateKybRequirements', () => {
    const mockUpdateData: UpdateKybRequirementsDto = {
      kybRequirements: [
        {
          name: 'taxIdentificationNumber',
          label: 'Tax ID',
          type: 'string',
          editable: false,
          length: 15,
        },
      ],
    };

    describe('when called with valid data', () => {
      it('should call settingsService.updateKybRequirements with context and data', async () => {
        const mockResult = { success: true };
        settingsService.updateKybRequirements.mockResolvedValue(mockResult);

        const result = await controller.updateKybRequirements(mockRequestContext, mockUpdateData);

        expect(settingsService.updateKybRequirements).toHaveBeenCalledWith(
          mockRequestContext,
          mockUpdateData,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.updateKybRequirements.mockRejectedValue(error);

        await expect(
          controller.updateKybRequirements(mockRequestContext, mockUpdateData),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_KYB_REQUIREMENTS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.updateKybRequirements,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_KYB_REQUIREMENTS);
      });
    });
  });

  describe('updateCompanySubtypes', () => {
    const mockUpdateData: UpdateCompanySubtypesRequest = {
      companySubtypes: {
        BUSINESS: [{ value: 'Technology', default: true }],
      },
    };

    describe('when called with valid data', () => {
      it('should call settingsService.updateCompanySubTypes with context and data', async () => {
        const mockResult = { success: true };
        settingsService.updateCompanySubTypes.mockResolvedValue(mockResult);

        const result = await controller.updateCompanySubtypes(mockRequestContext, mockUpdateData);

        expect(settingsService.updateCompanySubTypes).toHaveBeenCalledWith(
          mockRequestContext,
          mockUpdateData,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.updateCompanySubTypes.mockRejectedValue(error);

        await expect(
          controller.updateCompanySubtypes(mockRequestContext, mockUpdateData),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_COMPANY_TYPES permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.updateCompanySubtypes,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_COMPANY_TYPES);
      });
    });
  });

  describe('getApiKey', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;

    describe('when called with valid environment', () => {
      it('should call settingsService.getApiKey with context and environment', async () => {
        const mockResult = { apiKey: 'test-key' };
        settingsService.getApiKey.mockResolvedValue(mockResult);

        const result = await controller.getApiKey(mockRequestContext, environment);

        expect(settingsService.getApiKey).toHaveBeenCalledWith(mockRequestContext, environment);
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.getApiKey.mockRejectedValue(error);

        await expect(controller.getApiKey(mockRequestContext, environment)).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require VIEW_API_KEY permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getApiKey,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_API_KEY);
      });
    });
  });

  describe('generateApiKey', () => {
    const environment = KONG_ENVIRONMENT.SANDBOX;

    describe('when called with valid environment', () => {
      it('should call settingsService.generateApiKey with context and environment', async () => {
        const mockResult = { apiKey: 'new-test-key' };
        settingsService.generateApiKey.mockResolvedValue(mockResult);

        const result = await controller.generateApiKey(mockRequestContext, environment);

        expect(settingsService.generateApiKey).toHaveBeenCalledWith(
          mockRequestContext,
          environment,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.generateApiKey.mockRejectedValue(error);

        await expect(
          controller.generateApiKey(mockRequestContext, environment),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require RESET_API_KEY permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.generateApiKey,
        );
        expect(requiredPermission).toBe(PERMISSIONS.RESET_API_KEY);
      });
    });
  });

  describe('getIPRestriction', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;

    describe('when called with valid environment', () => {
      it('should call settingsService.getIPRestriction with context and environment', async () => {
        const mockResult = { ipRestrictions: ['192.168.1.1'] };
        settingsService.getIPRestriction.mockResolvedValue(mockResult);

        const result = await controller.getIPRestriction(mockRequestContext, environment);

        expect(settingsService.getIPRestriction).toHaveBeenCalledWith(
          mockRequestContext,
          environment,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.getIPRestriction.mockRejectedValue(error);

        await expect(
          controller.getIPRestriction(mockRequestContext, environment),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require VIEW_API_RESTRICTIONS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getIPRestriction,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_API_RESTRICTIONS);
      });
    });
  });

  describe('setIPRestriction', () => {
    const environment = KONG_ENVIRONMENT.SANDBOX;
    const mockIPRestrictionData: IPRestrictionRequest = {
      ipRestrictions: ['192.168.1.1', '10.0.0.1'],
    };

    describe('when called with valid data', () => {
      it('should call settingsService.setIPRestriction with context, environment, and data', async () => {
        const mockResult = { success: true };
        settingsService.setIPRestriction.mockResolvedValue(mockResult);

        const result = await controller.setIPRestriction(
          mockRequestContext,
          environment,
          mockIPRestrictionData,
        );

        expect(settingsService.setIPRestriction).toHaveBeenCalledWith(
          mockRequestContext,
          environment,
          mockIPRestrictionData,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.setIPRestriction.mockRejectedValue(error);

        await expect(
          controller.setIPRestriction(mockRequestContext, environment, mockIPRestrictionData),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require SET_API_RESTRICTIONS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.setIPRestriction,
        );
        expect(requiredPermission).toBe(PERMISSIONS.SET_API_RESTRICTIONS);
      });
    });
  });

  describe('getClientID', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;

    describe('when called with valid environment', () => {
      it('should call settingsService.getClient with context and environment', async () => {
        const mockResult = { clientId: 'test-client-id' };
        settingsService.getClient.mockResolvedValue(mockResult);

        const result = await controller.getClientID(mockRequestContext, environment);

        expect(settingsService.getClient).toHaveBeenCalledWith(mockRequestContext, environment);
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.getClient.mockRejectedValue(error);

        await expect(controller.getClientID(mockRequestContext, environment)).rejects.toThrow(
          error,
        );
      });
    });

    describe('permissions', () => {
      it('should require VIEW_CLIENT permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getClientID,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_CLIENT);
      });
    });
  });

  describe('setClientID', () => {
    const environment = KONG_ENVIRONMENT.SANDBOX;
    const mockClientData: ClientRequest = {
      clientId: 'new-client-id',
    };

    describe('when called with valid data', () => {
      it('should call settingsService.setClient with context, environment, and data', async () => {
        const mockResult = { success: true };
        settingsService.setClient.mockResolvedValue(mockResult);

        const result = await controller.setClientID(
          mockRequestContext,
          environment,
          mockClientData,
        );

        expect(settingsService.setClient).toHaveBeenCalledWith(
          mockRequestContext,
          environment,
          mockClientData,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.setClient.mockRejectedValue(error);

        await expect(
          controller.setClientID(mockRequestContext, environment, mockClientData),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require SET_CLIENT permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.setClientID,
        );
        expect(requiredPermission).toBe(PERMISSIONS.SET_CLIENT);
      });
    });
  });

  describe('editSettings', () => {
    const settingsType = SETTINGS_TYPES.BUSINESS_SETTINGS;
    const mockData = { someField: 'value' };

    describe('when called with valid data', () => {
      it('should call settingsService.editSettings with context, settingsType, and data', async () => {
        const mockResult = { success: true };
        settingsService.editSettings.mockResolvedValue(mockResult);

        const result = await controller.editSettings(mockData, mockRequestContext, settingsType);

        expect(settingsService.editSettings).toHaveBeenCalledWith(
          mockRequestContext,
          settingsType,
          mockData,
        );
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.editSettings.mockRejectedValue(error);

        await expect(
          controller.editSettings(mockData, mockRequestContext, settingsType),
        ).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_SYSTEM_SETTING permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.editSettings,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_SYSTEM_SETTING);
      });
    });
  });

  describe('viewSettings', () => {
    const settingsType = SETTINGS_TYPES.BUSINESS_SETTINGS;

    describe('when called with valid settingsType', () => {
      it('should call settingsService.viewSettings with settingsType', async () => {
        const mockResult = { settings: {} };
        settingsService.viewSettings.mockResolvedValue(mockResult);

        const result = await controller.viewSettings(settingsType);

        expect(settingsService.viewSettings).toHaveBeenCalledWith(settingsType);
        expect(result).toBe(mockResult);
      });

      it('should propagate service errors', async () => {
        const error = new Error('Service error');
        settingsService.viewSettings.mockRejectedValue(error);

        await expect(controller.viewSettings(settingsType)).rejects.toThrow(error);
      });
    });

    describe('permissions', () => {
      it('should require VIEW_SYSTEM_SETTING permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.viewSettings,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_SYSTEM_SETTING);
      });
    });

    describe('serialization', () => {
      it('should have exposeAll strategy configured', () => {
        const serializeOptions = reflector.get(
          'class_serializer:options',
          controller.viewSettings,
        );
        expect(serializeOptions).toBeDefined();
      });
    });
  });
});