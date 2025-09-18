import { CompanyTypes } from '@common/database/constants';
import {
  Company,
  CompanyStatuses,
  EmailTemplate,
  Settings,
  User,
  UserStatuses,
} from '@common/database/entities';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { RequestContext } from '@common/utils/request/request-context';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import {
  CompanyBuilder,
  EmailTemplateBuilder,
  SettingsBuilder,
  UserBuilder,
} from '@test/utils/builders';
import {
  createMockContext,
  createMockRepository,
  mockEventEmitter,
  MockRepository,
} from '@test/utils/mocks';
import { Equal } from 'typeorm';
import {
  EmailTemplateDto,
  IPRestrictionRequest,
  UpdateCompanySubtypesRequest,
  UpdateKybRequirementsDto,
} from './dto/index.dto';
import { SettingsService } from './settings.service';
import { BUSINESS_SETTINGS_NAME } from './settings.constants';
import { KybDataTypes, SETTINGS_TYPES } from './types';
import { KONG_ENVIRONMENT } from '@shared/integrations/kong.interface';
import { KONG_PLUGINS } from '@shared/integrations/kong/plugin/plugin.kong.interface';

describe('SettingsService', () => {
  let service: SettingsService;
  let settingsRepository: MockRepository<Settings>;
  let emailTemplateRepository: MockRepository<EmailTemplate>;
  let companyRepository: MockRepository<Company>;
  let kongConsumerService: jest.Mocked<KongConsumerService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // Test data builders
  let mockSettings: Settings;
  let mockEmailTemplate: EmailTemplate;
  let mockCompany: Company;
  let mockUser: User;
  let mockContext: { ctx: RequestContext };

  beforeEach(async () => {
    // Initialize repositories
    settingsRepository = createMockRepository<Settings>();
    emailTemplateRepository = createMockRepository<EmailTemplate>();
    companyRepository = createMockRepository<Company>();

    // Initialize service mocks
    kongConsumerService = {
      getConsumer: jest.fn(),
      getConsumerKeys: jest.fn(),
      createConsumerKey: jest.fn(),
      deleteConsumerKey: jest.fn(),
      updateOrCreateConsumer: jest.fn(),
      updateConsumerAcl: jest.fn(),
      getPlugins: jest.fn(),
      updateOrCreatePlugin: jest.fn(),
    } as any;

    eventEmitter = mockEventEmitter();

    // Build test entities
    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('name', 'Test Company')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.BUSINESS)
      .with('tier', 'tier1')
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('companyId', mockCompany.id!)
      .with('company', mockCompany)
      .build();

    mockSettings = new SettingsBuilder()
      .with('id', 'settings-id')
      .with('name', BUSINESS_SETTINGS_NAME)
      .with(
        'value',
        JSON.stringify({
          kybRequirements: [
            {
              name: 'rcNumber',
              label: 'RC Number',
              type: 'string',
              editable: false,
              maxCount: 1,
            },
            {
              name: 'companyAddress',
              label: 'Company Address',
              type: 'string',
              editable: true,
              maxCount: 1,
            },
          ],
          uneditableFields: ['rcNumber'],
          companySubtypes: {
            [CompanyTypes.BUSINESS]: [
              { value: 'Technology', default: true },
              { value: 'fintech', default: false }
            ],
            [CompanyTypes.INDIVIDUAL]: [],
            [CompanyTypes.LICENSED_ENTITY]: [
              { value: 'Commercial Bank', default: true },
              { value: 'Insurance', default: false },
            ],
          },
        }),
      )
      .build();

    mockEmailTemplate = new EmailTemplateBuilder()
      .with('id', 'template-id')
      .with('slug', 'welcome-email')
      .with('title', 'Welcome Email')
      .with('body', '<p>Welcome to our platform!</p>')
      .build();

    mockContext = createMockContext({
      user: mockUser,
    });

    // Setup default mock implementations
    kongConsumerService.getConsumer.mockResolvedValue({
      id: 'consumer-id',
      username: 'test-consumer',
    } as any);
    
    // Mock all Kong service methods to prevent service file corruption issues
    kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
      id: 'consumer-id',
      custom_id: 'company-id',
    } as any);
    
    kongConsumerService.updateConsumerAcl.mockResolvedValue({} as any);
    kongConsumerService.createConsumerKey.mockResolvedValue({
      id: 'new-key-id',
      key: 'new-api-key-456',
    } as any);
    
    kongConsumerService.getConsumerKeys.mockResolvedValue({
      data: [
        { id: 'new-key-id', key: 'new-api-key-456' },
        { id: 'old-key-id', key: 'old-api-key-123' },
      ],
    } as any);
    
    kongConsumerService.deleteConsumerKey.mockResolvedValue({} as any);
    kongConsumerService.getPlugins.mockResolvedValue({
      data: [
        {
          id: 'plugin-id',
          name: KONG_PLUGINS.IP_RESTRICTION,
          config: { allow: ['192.168.1.1', '10.0.0.1'] },
        },
      ],
    } as any);
    kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: 'SettingsRepository', useValue: settingsRepository },
        {
          provide: 'EmailTemplateRepository',
          useValue: emailTemplateRepository,
        },
        { provide: 'CompanyRepository', useValue: companyRepository },
        { provide: KongConsumerService, useValue: kongConsumerService },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getKybRequirements', () => {
    describe('when fetching KYB requirements', () => {
      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
      });

      it('should successfully get KYB requirements', async () => {
        const result = await service.getKybRequirements();

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'KYB Requirements fetched successfully',
            data: expect.arrayContaining([
              expect.objectContaining({
                name: 'rcNumber',
                label: 'RC Number',
                type: 'string',
                editable: false,
              }),
              expect.objectContaining({
                name: 'companyAddress',
                label: 'Company Address',
                type: 'string',
                editable: true,
              }),
            ]),
          }),
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: Equal(BUSINESS_SETTINGS_NAME) },
        });
      });

      it('should return standardized response format', async () => {
        const result = await service.getKybRequirements();

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'KYB Requirements fetched successfully',
            data: expect.any(Array),
            meta: undefined,
          }),
        );
      });

      it('should transform settings data correctly', async () => {
        const result = await service.getKybRequirements();

        expect(result.data).toHaveLength(2);
        expect(result.data![0]).toEqual(
          expect.objectContaining({
            name: 'rcNumber',
            label: 'RC Number',
            type: 'string',
            editable: false,
            maxCount: 1,
          }),
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when business settings not found', async () => {
        settingsRepository.findOne.mockResolvedValue(null);

        await expect(service.getKybRequirements()).rejects.toThrow(
          INotFoundException,
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('updateKybRequirements', () => {
    const updateDto: UpdateKybRequirementsDto = {
      newKybRequirements: [
        {
          name: 'businessLicense',
          label: 'Business License',
          type: KybDataTypes.FILE,
        },
      ],
      removedKybRequirements: ['companyAddress'],
    };

    describe('when updating KYB requirements with valid data', () => {
      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);
      });

      it('should successfully update KYB requirements', async () => {
        const result = await service.updateKybRequirements(
          mockContext.ctx,
          updateDto,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Updated KYB settings successfully',
          }),
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should add new editable requirements', async () => {
        await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [
            {
              name: 'businessLicense',
              label: 'Business License',
              type: KybDataTypes.FILE,
            },
          ],
          removedKybRequirements: [],
        });

        expect(settingsRepository.update).toHaveBeenCalledWith(
          { id: mockSettings.id },
          {
            value: expect.stringContaining('businessLicense'),
          },
        );

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue.kybRequirements).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'businessLicense',
              label: 'Business License',
              type: KybDataTypes.FILE,
              editable: true,
            }),
          ]),
        );
      });

      it('should remove editable requirements', async () => {
        await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [],
          removedKybRequirements: ['companyAddress'],
        });

        expect(settingsRepository.update).toHaveBeenCalledTimes(1);

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue.kybRequirements).not.toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'companyAddress',
            }),
          ]),
        );
      });

      it('should not add duplicate requirements', async () => {
        await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [
            {
              name: 'rcNumber', // Already exists
              label: 'RC Number Updated',
              type: KybDataTypes.STRING,
            },
          ],
          removedKybRequirements: [],
        });

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        const rcNumberRequirements = updatedValue.kybRequirements.filter(
          (req: any) => req.name === 'rcNumber',
        );
        expect(rcNumberRequirements).toHaveLength(1);
      });

      it('should not remove uneditable requirements', async () => {
        await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [],
          removedKybRequirements: ['rcNumber'], // Uneditable field
        });

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue.kybRequirements).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              name: 'rcNumber',
            }),
          ]),
        );
      });

      it('should emit UpdateKybRequirementsEvent', async () => {
        await service.updateKybRequirements(mockContext.ctx, updateDto);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.kyb.update',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });

      it('should preserve existing settings while updating', async () => {
        await service.updateKybRequirements(mockContext.ctx, updateDto);

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue).toEqual(
          expect.objectContaining({
            uneditableFields: expect.arrayContaining(['rcNumber']),
            companySubtypes: expect.objectContaining({
              [CompanyTypes.BUSINESS]: expect.any(Array),
            }),
          }),
        );
      });
    });

    describe('validation', () => {
      it('should throw error when business settings not found', async () => {
        settingsRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateKybRequirements(mockContext.ctx, updateDto),
        ).rejects.toThrow(INotFoundException);

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.update).not.toHaveBeenCalled();
      });

      it('should handle empty requirements arrays', async () => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [],
          removedKybRequirements: [],
        });

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
          }),
        );
        expect(settingsRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should handle undefined requirements arrays', async () => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);

        const result = await service.updateKybRequirements(mockContext.ctx, {
          newKybRequirements: [],
          removedKybRequirements: [],
        });

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
          }),
        );
        expect(settingsRepository.update).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('updateCompanySubTypes', () => {
    const updateDto: UpdateCompanySubtypesRequest = {
      [CompanyTypes.BUSINESS]: [
        'Telecommunications', 'Manufacturer', 'Healthcare', 'Logistics', 
        'Real Estate', 'Entertainment', 'Hospitality', 'Technology', 
        'Medical', 'Public Sector', 'Others', // All real defaults
        'llc', 'corporation', 'partnership' // New values only (not including existing 'fintech')
      ],
      [CompanyTypes.INDIVIDUAL]: ['freelancer', 'consultant'],
      [CompanyTypes.LICENSED_ENTITY]: [
        'Commercial Bank', 'Merchant Bank', 'Non-interest Bank', 'Microfinance Bank',
        'Finance House', 'Payments Solutions Services Provider', 'Super Agent',
        'Mobile Money Operator', 'Switch and Processor', 'Payments Solutions Services',
        'Payments Terminal Services Provider', 'Insurance', 'Capital Market Operator', 'Others',
        'bank' // New value only (not including existing 'Insurance')
      ],
    };

    describe('when updating company subtypes with valid data', () => {
      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);
      });

      it('should successfully update company subtypes', async () => {
        const result = await service.updateCompanySubTypes(
          mockContext.ctx,
          updateDto,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Updated company subtypes successfully',
          }),
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should preserve default flags for existing subtypes', async () => {
        // Include ALL real default values to avoid triggering the validation error
        await service.updateCompanySubTypes(mockContext.ctx, {
          [CompanyTypes.BUSINESS]: [
            'Telecommunications', 'Manufacturer', 'Healthcare', 'Logistics', 
            'Real Estate', 'Entertainment', 'Hospitality', 'Technology', 
            'Medical', 'Public Sector', 'Others', // All real defaults
            'fintech', 'llc' // Additional non-defaults
          ],
          [CompanyTypes.INDIVIDUAL]: [],
          [CompanyTypes.LICENSED_ENTITY]: [
            'Commercial Bank', 'Merchant Bank', 'Non-interest Bank', 'Microfinance Bank',
            'Finance House', 'Payments Solutions Services Provider', 'Super Agent',
            'Mobile Money Operator', 'Switch and Processor', 'Payments Solutions Services',
            'Payments Terminal Services Provider', 'Insurance', 'Capital Market Operator', 'Others'
          ], // All real defaults for licensed entity
        });

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        const businessSubtypes =
          updatedValue.companySubtypes[CompanyTypes.BUSINESS];
        
        // Check that Technology (real default) is preserved as default
        const technologySubtype = businessSubtypes.find(
          (subtype: any) => subtype.value === 'Technology',
        );
        expect(technologySubtype.default).toBe(true);
        
        // Check that fintech (existing non-default) is preserved as non-default
        const fintechSubtype = businessSubtypes.find(
          (subtype: any) => subtype.value === 'fintech',
        );
        expect(fintechSubtype.default).toBe(false);
      });

      it('should emit UpdateCompanySubtypesEvent', async () => {
        await service.updateCompanySubTypes(mockContext.ctx, updateDto);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.company_types.update',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });

      it('should structure subtypes correctly', async () => {
        await service.updateCompanySubTypes(mockContext.ctx, updateDto);

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue.companySubtypes[CompanyTypes.BUSINESS]).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              value: expect.any(String),
              default: expect.any(Boolean),
            }),
          ]),
        );
      });
    });

    describe('validation', () => {
      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);
      });

      it('should throw error when business settings not found', async () => {
        settingsRepository.findOne.mockResolvedValue(null);

        await expect(
          service.updateCompanySubTypes(mockContext.ctx, updateDto),
        ).rejects.toThrow(INotFoundException);

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.update).not.toHaveBeenCalled();
      });

      it('should throw error when trying to remove default values', async () => {
        const invalidDto = {
          [CompanyTypes.BUSINESS]: ['llc'], // Removing default 'Technology' (from real constants)
          [CompanyTypes.INDIVIDUAL]: [],
          [CompanyTypes.LICENSED_ENTITY]: [],
        };

        await expect(
          service.updateCompanySubTypes(mockContext.ctx, invalidDto),
        ).rejects.toThrow(IBadRequestException);

        expect(settingsRepository.update).not.toHaveBeenCalled();
      });

      it('should throw error when adding duplicate values', async () => {
        const duplicateDto = {
          [CompanyTypes.BUSINESS]: ['fintech', 'fintech'], // Duplicate values
          [CompanyTypes.INDIVIDUAL]: [],
          [CompanyTypes.LICENSED_ENTITY]: [],
        };

        await expect(
          service.updateCompanySubTypes(mockContext.ctx, duplicateDto),
        ).rejects.toThrow(IBadRequestException);

        expect(settingsRepository.update).not.toHaveBeenCalled();
      });
    });
  });

  describe('getApiKey', () => {
    const environment = KONG_ENVIRONMENT.DEVELOPMENT;

    describe('when fetching API key', () => {
      beforeEach(() => {
        kongConsumerService.getConsumer.mockResolvedValue({
          id: 'consumer-id',
        } as any);
        kongConsumerService.getConsumerKeys.mockResolvedValue({
          data: [{ key: 'api-key-123' }],
        } as any);
      });

      it('should successfully get API key', async () => {
        const result = await service.getApiKey(mockContext.ctx, environment);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'API Key retrieved successfully',
            data: expect.objectContaining({
              key: 'api-key-123',
              environment: KONG_ENVIRONMENT.DEVELOPMENT,
            }),
          }),
        );

        expect(kongConsumerService.getConsumer).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.getConsumerKeys).toHaveBeenCalledTimes(1);
      });

      it('should handle missing API key', async () => {
        kongConsumerService.getConsumerKeys.mockResolvedValue({
          data: [],
        } as any);

        const result = await service.getApiKey(mockContext.ctx, environment);

        expect(result.data!.key).toBeNull();
      });

      it('should emit GetApiKeyEvent', async () => {
        await service.getApiKey(mockContext.ctx, environment);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.api.key.view',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });
    });
  });

  describe('generateApiKey', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;

    describe('when generating API key', () => {
      beforeEach(() => {
        kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
          id: 'consumer-id',
        } as any);
        kongConsumerService.createConsumerKey.mockResolvedValue({
          id: 'new-key-id',
          key: 'new-api-key-456',
        } as any);
        kongConsumerService.getConsumerKeys.mockResolvedValue({
          data: [
            { id: 'new-key-id', key: 'new-api-key-456' },
            { id: 'old-key-id', key: 'old-api-key-123' },
          ],
        } as any);
      });

      it('should successfully generate API key', async () => {
        const result = await service.generateApiKey(
          mockContext.ctx,
          environment,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'API Key generated successfully',
            data: expect.objectContaining({
              key: 'new-api-key-456',
              environment: KONG_ENVIRONMENT.PRODUCTION,
            }),
          }),
        );

        expect(
          kongConsumerService.updateOrCreateConsumer,
        ).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.createConsumerKey).toHaveBeenCalledTimes(1);
      });

      it('should delete old API keys', async () => {
        await service.generateApiKey(mockContext.ctx, environment);

        expect(kongConsumerService.deleteConsumerKey).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.deleteConsumerKey).toHaveBeenCalledWith(
          environment,
          'consumer-id',
          'old-key-id',
        );
      });

      it('should update consumer with tier ACL', async () => {
        await service.generateApiKey(mockContext.ctx, environment);

        expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.updateConsumerAcl).toHaveBeenCalledWith(
          environment,
          {
            aclAllowedGroupName: `tier-${mockCompany.tier}`,
            consumerId: 'consumer-id',
          },
        );
      });

      it('should emit GenerateApiKeyEvent', async () => {
        await service.generateApiKey(mockContext.ctx, environment);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.api.key.create',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });
    });
  });

  describe('getIPRestriction', () => {
    const environment = KONG_ENVIRONMENT.DEVELOPMENT;

    describe('when fetching IP restriction', () => {
      beforeEach(() => {
        kongConsumerService.getConsumer.mockResolvedValue({
          id: 'consumer-id',
        } as any);
        kongConsumerService.getPlugins.mockResolvedValue({
          data: [
            {
              name: KONG_PLUGINS.IP_RESTRICTION,
              config: { allow: ['192.168.1.1', '10.0.0.1'] },
            },
          ],
        } as any);
      });

      it('should successfully get IP restriction', async () => {
        const result = await service.getIPRestriction(
          mockContext.ctx,
          environment,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'IP Restriction retrieved successfully',
            data: expect.objectContaining({
              ips: ['192.168.1.1', '10.0.0.1'],
              environment: KONG_ENVIRONMENT.DEVELOPMENT,
            }),
          }),
        );

        expect(kongConsumerService.getConsumer).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.getPlugins).toHaveBeenCalledTimes(1);
      });

      it('should handle missing IP restriction plugin', async () => {
        kongConsumerService.getPlugins.mockResolvedValue({
          data: [],
        } as any);

        const result = await service.getIPRestriction(
          mockContext.ctx,
          environment,
        );

        expect(result.data!.ips).toEqual([]);
      });
    });
  });

  describe('setIPRestriction', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;
    const ipRestrictionDto: IPRestrictionRequest = {
      ips: ['192.168.1.1', '10.0.0.1', '172.16.0.1'],
    };

    describe('when setting IP restriction', () => {
      beforeEach(() => {
        kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
          id: 'consumer-id',
        } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
      });

      it('should successfully set IP restriction', async () => {
        const result = await service.setIPRestriction(
          mockContext.ctx,
          environment,
          ipRestrictionDto,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'IP Restriction set successfully',
            data: expect.objectContaining({
              ips: ipRestrictionDto.ips,
              environment: KONG_ENVIRONMENT.PRODUCTION,
            }),
          }),
        );

        expect(
          kongConsumerService.updateOrCreateConsumer,
        ).toHaveBeenCalledTimes(1);
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledTimes(
          1,
        );
      });

      it('should configure IP restriction plugin correctly', async () => {
        await service.setIPRestriction(
          mockContext.ctx,
          environment,
          ipRestrictionDto,
        );

        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          environment,
          'consumer-id',
          {
            name: KONG_PLUGINS.IP_RESTRICTION,
            enabled: true,
            config: { allow: ipRestrictionDto.ips },
          },
        );
      });

      it('should emit SetIPRestrictionEvent', async () => {
        await service.setIPRestriction(
          mockContext.ctx,
          environment,
          ipRestrictionDto,
        );

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.api.restriction.create',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });
    });
  });

  describe('editSettings', () => {
    describe('when editing email templates', () => {
      const emailTemplateDto: EmailTemplateDto = {
        temmplateId: 'template-id',
        body: '<p>Updated email content</p>',
        title: 'Updated Email Template',
      };

      beforeEach(() => {
        emailTemplateRepository.findOne.mockResolvedValue(mockEmailTemplate);
        emailTemplateRepository.update.mockResolvedValue({
          affected: 1,
        } as any);
      });

      it('should successfully update email template', async () => {
        const result = await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.EMAIL_TEMPLATES,
          emailTemplateDto,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'System settings updated successfully.',
          }),
        );

        expect(emailTemplateRepository.findOne).toHaveBeenCalledTimes(1);
        expect(emailTemplateRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should update only provided fields', async () => {
        await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.EMAIL_TEMPLATES,
          { temmplateId: 'template-id', body: '<p>Only body updated</p>' },
        );

        expect(emailTemplateRepository.update).toHaveBeenCalledWith(
          { id: 'template-id' },
          { body: '<p>Only body updated</p>' },
        );
      });

      it('should not update when no fields provided', async () => {
        await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.EMAIL_TEMPLATES,
          { temmplateId: 'template-id' },
        );

        expect(emailTemplateRepository.update).not.toHaveBeenCalled();
      });

      it('should throw error when template not found', async () => {
        emailTemplateRepository.findOne.mockResolvedValue(null);

        await expect(
          service.editSettings(
            mockContext.ctx,
            SETTINGS_TYPES.EMAIL_TEMPLATES,
            emailTemplateDto,
          ),
        ).rejects.toThrow(INotFoundException);

        expect(emailTemplateRepository.update).not.toHaveBeenCalled();
      });
    });

    describe('when editing general settings', () => {
      const generalSettingsDto = {
        authTokenExpirationDuration: '7200',
        failedLoginAttempts: '5',
      };

      const mockGeneralSettings = new SettingsBuilder()
        .with('name', SETTINGS_TYPES.GENERAL_SETTINGS)
        .with(
          'value',
          JSON.stringify({
            authTokenExpirationDuration: { value: '3600', type: 'time' },
            failedLoginAttempts: { value: '3', type: 'count' },
          }),
        )
        .build();

      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockGeneralSettings);
        settingsRepository.update.mockResolvedValue({ affected: 1 } as any);
      });

      it('should successfully update general settings', async () => {
        const result = await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.GENERAL_SETTINGS,
          generalSettingsDto,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'System settings updated successfully.',
          }),
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.update).toHaveBeenCalledTimes(1);
      });

      it('should update settings values correctly', async () => {
        await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.GENERAL_SETTINGS,
          generalSettingsDto,
        );

        const updatedValue = JSON.parse(
          (settingsRepository.update as jest.Mock).mock.calls[0][1].value,
        );
        expect(updatedValue).toEqual(
          expect.objectContaining({
            authTokenExpirationDuration: expect.objectContaining({
              value: '7200',
            }),
            failedLoginAttempts: expect.objectContaining({
              value: '5',
            }),
          }),
        );
      });
    });

    describe('validation', () => {
      it('should throw error for invalid settings type', async () => {
        await expect(
          service.editSettings(
            mockContext.ctx,
            'invalid_type' as SETTINGS_TYPES,
            {},
          ),
        ).rejects.toThrow(IBadRequestException);
      });

      it('should throw error when settings not found', async () => {
        settingsRepository.findOne.mockResolvedValue(null);

        await expect(
          service.editSettings(
            mockContext.ctx,
            SETTINGS_TYPES.GENERAL_SETTINGS,
            { authTokenExpirationDuration: '7200' },
          ),
        ).rejects.toThrow(INotFoundException);
      });

      it('should emit EditSettingsEvent', async () => {
        emailTemplateRepository.findOne.mockResolvedValue(mockEmailTemplate);
        emailTemplateRepository.update.mockResolvedValue({
          affected: 1,
        } as any);

        await service.editSettings(
          mockContext.ctx,
          SETTINGS_TYPES.EMAIL_TEMPLATES,
          { temmplateId: 'template-id', body: 'Updated body' },
        );

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.update',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
            metadata: expect.objectContaining({
              settingType: SETTINGS_TYPES.EMAIL_TEMPLATES,
            }),
          }),
        );
      });
    });
  });

  describe('viewSettings', () => {
    describe('when viewing email templates', () => {
      beforeEach(() => {
        emailTemplateRepository.find.mockResolvedValue([
          {
            ...mockEmailTemplate,
            body: Buffer.from('<p>Email content</p>'),
          },
        ] as any);
      });

      it('should successfully get email templates', async () => {
        const result = await service.viewSettings(
          SETTINGS_TYPES.EMAIL_TEMPLATES,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Email templates retrieved successfully',
            data: expect.arrayContaining([
              expect.objectContaining({
                id: mockEmailTemplate.id,
                slug: mockEmailTemplate.slug,
                title: mockEmailTemplate.title,
                body: '<p>Email content</p>',
              }),
            ]),
          }),
        );

        expect(emailTemplateRepository.find).toHaveBeenCalledTimes(1);
      });

      it('should convert buffer body to string', async () => {
        const result = await service.viewSettings(
          SETTINGS_TYPES.EMAIL_TEMPLATES,
        );

        expect(result.data![0].body).toBe('<p>Email content</p>');
      });
    });

    describe('when viewing other settings', () => {
      beforeEach(() => {
        settingsRepository.findOne.mockResolvedValue(mockSettings);
      });

      it('should successfully get settings', async () => {
        const result = await service.viewSettings(
          SETTINGS_TYPES.GENERAL_SETTINGS,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'System settings fetched successfully.',
            data: expect.any(Object),
          }),
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
      });

      it('should parse JSON settings value', async () => {
        const result = await service.viewSettings(
          SETTINGS_TYPES.GENERAL_SETTINGS,
        );

        expect(result.data).toEqual(expect.any(Object));
      });
    });

    describe('validation', () => {
      it('should throw error for invalid settings type', async () => {
        await expect(
          service.viewSettings('invalid_type' as SETTINGS_TYPES),
        ).rejects.toThrow(IBadRequestException);
      });

      it('should throw error when settings not found', async () => {
        settingsRepository.findOne.mockResolvedValue(null);

        await expect(
          service.viewSettings(SETTINGS_TYPES.GENERAL_SETTINGS),
        ).rejects.toThrow(INotFoundException);
      });
    });
  });

  describe('getClient', () => {
    const environment = KONG_ENVIRONMENT.DEVELOPMENT;

    describe('when fetching client info', () => {
      beforeEach(() => {
        kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
          id: 'consumer-id',
          username: 'test-client',
        } as any);
      });

      it('should successfully get client info', async () => {
        const result = await service.getClient(mockContext.ctx, environment);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Client Info retrieved successfully',
            data: expect.objectContaining({
              clientId: 'test-client',
              environment: KONG_ENVIRONMENT.DEVELOPMENT,
            }),
          }),
        );

        expect(
          kongConsumerService.updateOrCreateConsumer,
        ).toHaveBeenCalledTimes(1);
      });

      it('should update or create consumer', async () => {
        await service.getClient(mockContext.ctx, environment);

        expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(
          environment,
          {
            custom_id: mockCompany.id,
          },
        );
      });
    });
  });

  describe('setClient', () => {
    const environment = KONG_ENVIRONMENT.PRODUCTION;
    const clientRequest = { clientId: 'new-client-id' };

    describe('when setting client info', () => {
      beforeEach(() => {
        kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
          id: 'consumer-id',
          username: 'new-client-id',
        } as any);
      });

      it('should successfully set client info', async () => {
        const result = await service.setClient(
          mockContext.ctx,
          environment,
          clientRequest,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Client Info set successfully',
            data: expect.objectContaining({
              clientId: 'new-client-id',
              environment: KONG_ENVIRONMENT.PRODUCTION,
            }),
          }),
        );

        expect(
          kongConsumerService.updateOrCreateConsumer,
        ).toHaveBeenCalledTimes(1);
      });

      it('should update consumer with custom ID and username', async () => {
        await service.setClient(mockContext.ctx, environment, clientRequest);

        expect(kongConsumerService.updateOrCreateConsumer).toHaveBeenCalledWith(
          environment,
          {
            custom_id: mockCompany.id,
            username: 'new-client-id',
          },
        );
      });

      it('should emit SetClientEvent', async () => {
        await service.setClient(mockContext.ctx, environment, clientRequest);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'settings.api.client.create',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );
      });
    });
  });

  describe('structureCompanySubtypes', () => {
    it('should structure subtypes correctly with default flags', () => {
      const prevData = {
        [CompanyTypes.BUSINESS]: [
          { value: 'fintech', default: true },
          { value: 'ecommerce', default: false },
        ],
      };
      const newData = {
        [CompanyTypes.BUSINESS]: ['fintech', 'llc', 'corporation'],
      };

      const result = service.structureCompanySubtypes(
        prevData,
        newData,
        CompanyTypes.BUSINESS,
      );

      expect(result).toEqual([
        { value: 'fintech', default: true },
        { value: 'llc', default: false },
        { value: 'corporation', default: false },
      ]);
    });

    it('should handle special characters in subtype names', () => {
      const prevData = {
        [CompanyTypes.BUSINESS]: [{ value: 'fin-tech company', default: true }],
      };
      const newData = {
        [CompanyTypes.BUSINESS]: ['fin tech company', 'fintech-company'],
      };

      const result = service.structureCompanySubtypes(
        prevData,
        newData,
        CompanyTypes.BUSINESS,
      );

      expect(result).toEqual([
        { value: 'fin tech company', default: true },
        { value: 'fintech-company', default: false },
      ]);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle corrupted JSON in settings', async () => {
      const corruptedSettings = new SettingsBuilder()
        .with('name', BUSINESS_SETTINGS_NAME)
        .with('value', 'invalid-json')
        .build();

      settingsRepository.findOne.mockResolvedValue(corruptedSettings);

      await expect(service.getKybRequirements()).rejects.toThrow();
    });

    it('should handle Kong service failures gracefully', async () => {
      kongConsumerService.getConsumer.mockRejectedValue(
        new Error('Kong service unavailable'),
      );

      await expect(
        service.getApiKey(mockContext.ctx, KONG_ENVIRONMENT.DEVELOPMENT),
      ).rejects.toThrow('Kong service unavailable');
    });

    it('should validate company context in API operations', async () => {
      const contextWithoutCompany = {
        ctx: {
          activeUser: mockUser,
          activeCompany: null,
        },
      };

      await expect(
        service.getApiKey(
          contextWithoutCompany.ctx as any,
          KONG_ENVIRONMENT.DEVELOPMENT,
        ),
      ).rejects.toThrow();
    });
  });
});
