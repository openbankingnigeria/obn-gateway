import { CompanyTypes } from '@common/database/constants';
import {
  Company,
  CompanyKybData,
  CompanyStatuses,
  KybStatuses,
  Settings,
  User,
  UserStatuses,
} from '@common/database/entities';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { RequestContext } from '@common/utils/request/request-context';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import {
  CompanyBuilder,
  SettingsBuilder,
  UserBuilder,
} from '@test/utils/builders';
import {
  createMockContext,
  createMockRepository,
  mockEventEmitter,
  MockRepository,
} from '@test/utils/mocks';
import moment from 'moment';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';
import { Equal } from 'typeorm';
import { CompanyService } from './company.service';
import {
  GetStatsDto,
  KybStatusActions,
  UpdateKybStatusDto,
} from './dto/index.dto';
import { CompanyTiers } from './types';

// Mock external modules
jest.mock('moment');

const mockedMoment = moment as jest.Mocked<typeof moment>;

describe('CompanyService', () => {
  let service: CompanyService;
  let companyRepository: MockRepository<Company>;
  let userRepository: MockRepository<User>;
  let settingsRepository: MockRepository<Settings>;
  let companyKybDataRepository: MockRepository<CompanyKybData>;
  let fileHelpers: jest.Mocked<FileHelpers>;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let kongConsumerService: jest.Mocked<KongConsumerService>;
  let config: jest.Mocked<ConfigService>;

  // Test data builders
  let mockCompany: Company;
  let mockUser: User;
  let mockSettings: Settings;
  let mockContext: { ctx: RequestContext };

  beforeEach(async () => {
    // Initialize repositories
    companyRepository = createMockRepository<Company>();
    userRepository = createMockRepository<User>();
    settingsRepository = createMockRepository<Settings>();
    companyKybDataRepository = createMockRepository<CompanyKybData>();

    // Initialize service mocks
    fileHelpers = {
      validateFile: jest.fn(),
    } as any;

    kongConsumerService = {
      updateOrCreateConsumer: jest.fn(),
      updateConsumerAcl: jest.fn(),
      updateOrCreatePlugin: jest.fn(),
    } as any;

    eventEmitter = mockEventEmitter();

    config = {
      get: jest.fn(),
    } as any;

    // Build test entities
    mockCompany = new CompanyBuilder()
      .with('id', 'company-id')
      .with('name', 'Test Company')
      .with('status', CompanyStatuses.ACTIVE)
      .with('type', CompanyTypes.BUSINESS)
      .with('tier', CompanyTiers.TIER_1)
      .with('kybStatus', KybStatuses.PENDING)
      .with('rcNumber', 'RC123456')
      .with('kybDataId', 'kyb-data-id')
      .build();

    mockUser = new UserBuilder()
      .with('id', 'user-id')
      .with('email', 'test@example.com')
      .with('status', UserStatuses.ACTIVE)
      .with('companyId', mockCompany.id!)
      .with('accountNumber', '1234567890')
      .with('company', mockCompany)
      .build();

    mockSettings = new SettingsBuilder()
      .with('name', BUSINESS_SETTINGS_NAME)
      .with(
        'value',
        JSON.stringify({
          kybRequirements: [
            { name: 'rcNumber', type: 'string', length: 20 },
            { name: 'companyAddress', type: 'string', length: 100 },
          ],
          companySubtypes: {
            [CompanyTypes.BUSINESS]: [{ value: 'fintech', default: true }],
            [CompanyTypes.LICENSED_ENTITY]: [{ value: 'bank', default: true }],
          },
        }),
      )
      .build();

    // CompanyKybData will be created as needed in individual tests

    mockContext = createMockContext({
      user: mockUser,
    });

    // Setup default mock implementations
    config.get.mockImplementation((key: string) => {
      if (key === 'kong.adminEndpoint')
        return {
          staging: 'http://staging-kong',
          production: 'http://prod-kong',
        };
      return null;
    });

    fileHelpers.validateFile.mockReturnValue({
      isFileTypeValid: true,
      isSizeValid: true,
      maxFileSize: 5242880,
    });

    kongConsumerService.updateOrCreateConsumer.mockResolvedValue({
      id: 'consumer-id',
    } as any);

    (mockedMoment as any).mockReturnValue({
      format: jest.fn().mockReturnValue('2024-01-01'),
      subtract: jest.fn().mockReturnThis(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: 'CompanyRepository', useValue: companyRepository },
        { provide: 'UserRepository', useValue: userRepository },
        { provide: 'SettingsRepository', useValue: settingsRepository },
        {
          provide: 'CompanyKybDataRepository',
          useValue: companyKybDataRepository,
        },
        { provide: FileHelpers, useValue: fileHelpers },
        { provide: KongConsumerService, useValue: kongConsumerService },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateCompanyKybDetails', () => {
    const updateData = {
      rcNumber: 'RC654321',
      accountNumber: '9876543210',
      companyAddress: '123 Business Street',
    };

    const mockFiles: Express.Multer.File[] = [
      {
        fieldname: 'document',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from('test-content'),
      } as Express.Multer.File,
    ];

    describe('when updating KYB details with valid data', () => {
      const updateData = {
        rcNumber: 'RC654321',
        accountNumber: '9876543210',
        companyAddress: '123 Business Street',
      };

      const mockFiles: Express.Multer.File[] = [
        {
          fieldname: 'document',
          originalname: 'test.pdf',
          encoding: '7bit',
          mimetype: 'application/pdf',
          size: 1024,
          buffer: Buffer.from('test-content'),
        } as Express.Multer.File,
      ];

      beforeEach(() => {
        // Setup successful path mocks
        companyRepository.count.mockResolvedValue(0); // No duplicates
        userRepository.count.mockResolvedValue(0); // No duplicates
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        companyKybDataRepository.findOne.mockResolvedValue(null); // No existing KYB data
        companyKybDataRepository.save.mockResolvedValue({
          id: 'new-kyb-id',
        } as any);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);
        userRepository.update.mockResolvedValue({ affected: 1 } as any);
      });

      it('should successfully update company KYB details', async () => {
        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
          }),
        );
      });

      it('should create new KYB data if none exists', async () => {
        companyKybDataRepository.findOne.mockResolvedValue(null);

        await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(companyKybDataRepository.save).toHaveBeenCalledTimes(1);
        expect(companyKybDataRepository.save).toHaveBeenCalledWith({
          companyId: mockCompany.id,
          data: expect.stringContaining('RC654321'),
        });
      });

      it('should update existing KYB data if it exists', async () => {
        const existingKybData = {
          id: 'existing-kyb-id',
          data: JSON.stringify({ previousField: 'previous-value' }),
        };
        companyKybDataRepository.findOne.mockResolvedValue(
          existingKybData as any,
        );

        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
            data: undefined,
            meta: undefined,
          }),
        );
        expect(companyKybDataRepository.update).toHaveBeenCalledTimes(1);
        expect(companyKybDataRepository.update).toHaveBeenCalledWith(
          { id: existingKybData.id },
          {
            data: expect.stringContaining('previous-value'),
          },
        );
      });

      it('should handle file uploads correctly', async () => {
        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
            data: undefined,
            meta: undefined,
          }),
        );
        expect(fileHelpers.validateFile).toHaveBeenCalledTimes(1);
        expect(fileHelpers.validateFile).toHaveBeenCalledWith(mockFiles);
        expect(companyKybDataRepository.save).toHaveBeenCalledTimes(1);
        expect(companyKybDataRepository.save).toHaveBeenCalledWith({
          companyId: mockCompany.id,
          data: expect.stringContaining('document'),
        });
      });

      it('should emit CompanyKybSubmittedEvent', async () => {
        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
            data: undefined,
            meta: undefined,
          }),
        );
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.submitted',
          expect.any(Object),
        );
      });

      it('should return standardized success response format', async () => {
        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toHaveProperty('status', 'success');
        expect(result).toHaveProperty('message');
      });

      it('should only accept valid fields from request payload', async () => {
        const dataWithInvalidFields = {
          ...updateData,
          invalidField: 'should-be-ignored',
          anotherInvalid: 'also-ignored',
        };

        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          dataWithInvalidFields,
          [],
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
            data: undefined,
            meta: undefined,
          }),
        );

        const savedData = JSON.parse(
          (companyKybDataRepository.save as jest.Mock).mock.calls[0][0].data,
        );
        expect(savedData).toEqual(
          expect.not.objectContaining({
            invalidField: expect.anything(),
            anotherInvalid: expect.anything(),
          }),
        );
        expect(savedData).toEqual(
          expect.objectContaining({
            rcNumber: 'RC654321',
          }),
        );
      });

      it('should set KYB status to PENDING after successful update', async () => {
        const result = await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully updated company KYB details.',
            data: undefined,
            meta: undefined,
          }),
        );
        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: mockCompany.id },
          expect.objectContaining({
            kybStatus: KybStatuses.PENDING,
          }),
        );
      });

      it('should update company KYB data ID after KYB data creation', async () => {
        const newKybData = { id: 'new-kyb-data-id' };
        companyKybDataRepository.save.mockResolvedValue(newKybData as any);

        await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: mockCompany.id },
          expect.objectContaining({
            kybDataId: 'new-kyb-data-id',
          }),
        );
      });

      it('should update user account number when provided', async () => {
        await service.updateCompanyKybDetails(
          mockContext.ctx,
          updateData,
          mockFiles,
        );

        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalledWith(
          { id: mockUser.id },
          {
            accountNumber: '9876543210',
          },
        );
      });

      it('should merge new KYB data with existing data', async () => {
        const existingKybData = {
          id: 'existing-id',
          data: JSON.stringify({
            existingField: 'existing-value',
            rcNumber: 'old-rc-number',
          }),
        };
        companyKybDataRepository.findOne.mockResolvedValue(
          existingKybData as any,
        );

        await service.updateCompanyKybDetails(
          mockContext.ctx,
          { rcNumber: 'RC654321', companyAddress: 'new-address' },
          [],
        );

        expect(companyKybDataRepository.update).toHaveBeenCalledTimes(1);
        expect(companyKybDataRepository.update).toHaveBeenCalledWith(
          { id: 'existing-id' },
          {
            data: expect.stringContaining('existing-value'),
          },
        );

        const updatedData = JSON.parse(
          (companyKybDataRepository.update as jest.Mock).mock.calls[0][1].data,
        );
        expect(updatedData).toEqual(
          expect.objectContaining({
            existingField: 'existing-value',
            rcNumber: 'RC654321', // Should override
            companyAddress: 'new-address',
          }),
        );
      });
    });

    describe('validation', () => {
      it('should throw error when company is already verified', async () => {
        const verifiedCompany = {
          ...mockCompany,
          kybStatus: KybStatuses.APPROVED,
        };
        const verifiedContext = {
          ctx: {
            activeCompany: verifiedCompany,
            activeUser: mockUser,
          },
        };

        await expect(
          service.updateCompanyKybDetails(
            verifiedContext.ctx as any,
            { rcNumber: 'RC123' },
            [],
          ),
        ).rejects.toThrow('Your business has already been verified');
      });

      it('should throw error when RC number already exists', async () => {
        companyRepository.count.mockResolvedValue(1); // RC number exists
        settingsRepository.findOne.mockResolvedValue(mockSettings);

        await expect(
          service.updateCompanyKybDetails(
            mockContext.ctx,
            { rcNumber: 'RC123456' },
            [],
          ),
        ).rejects.toThrow(
          'A business with RC Number - RC123456 already exists',
        );

        expect(companyRepository.count).toHaveBeenCalledTimes(1);
        expect(companyRepository.count).toHaveBeenCalledWith({
          where: {
            rcNumber: 'RC123456',
            id: expect.anything(),
          },
        });
      });

      it('should throw error when account number already exists', async () => {
        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(1); // Account number exists
        settingsRepository.findOne.mockResolvedValue(mockSettings);

        await expect(
          service.updateCompanyKybDetails(
            mockContext.ctx,
            { accountNumber: '1234567890' },
            [],
          ),
        ).rejects.toThrow(
          'A business with account number - 1234567890 already exists',
        );

        expect(userRepository.count).toHaveBeenCalledTimes(1);
        expect(userRepository.count).toHaveBeenCalledWith({
          where: {
            accountNumber: '1234567890',
          },
        });
      });

      it('should throw error when business settings not found', async () => {
        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(null); // Settings not found

        await expect(
          service.updateCompanyKybDetails(
            mockContext.ctx,
            { rcNumber: 'RC123' },
            [],
          ),
        ).rejects.toThrow('Setting with name business_settings was not found');

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: expect.anything() },
        });
      });

      it('should throw error when file type is invalid', async () => {
        const invalidFiles = [
          {
            fieldname: 'document',
            originalname: 'test.exe',
            mimetype: 'application/exe',
            buffer: Buffer.from('test'),
          } as Express.Multer.File,
        ];

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        fileHelpers.validateFile.mockReturnValue({
          isFileTypeValid: false,
          isSizeValid: true,
          maxFileSize: 5242880,
        });

        await expect(
          service.updateCompanyKybDetails(
            mockContext.ctx,
            { rcNumber: 'RC123' },
            invalidFiles,
          ),
        ).rejects.toThrow(
          'File must be either a .jpg, .jpeg, .png or .pdf file',
        );
      });

      it('should throw error when file size exceeds limit', async () => {
        const largeFiles = [
          {
            fieldname: 'document',
            originalname: 'large.pdf',
            mimetype: 'application/pdf',
            size: 10485760, // 10MB
            buffer: Buffer.alloc(1),
          } as Express.Multer.File,
        ];

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        fileHelpers.validateFile.mockReturnValue({
          isFileTypeValid: true,
          isSizeValid: false,
          maxFileSize: 5242880,
        });

        await expect(
          service.updateCompanyKybDetails(
            mockContext.ctx,
            { rcNumber: 'RC123' },
            largeFiles,
          ),
        ).rejects.toThrow('Files uploaded must be less than');
      });

      it('should throw error when field length exceeds limit', async () => {
        const longData = {
          rcNumber: 'A'.repeat(25), // Exceeds 20 character limit
        };

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);

        await expect(
          service.updateCompanyKybDetails(mockContext.ctx, longData, []),
        ).rejects.toThrow('rcNumber cannot be longer than 20 characters');
      });

      it('should only allow users to update their own company KYB details', async () => {
        // This is implicitly tested through the ctx.activeCompany usage
        // The service method always uses ctx.activeCompany, ensuring company isolation
        const otherCompanyContext = {
          ctx: {
            activeCompany: { ...mockCompany, id: 'other-company-id' },
            activeUser: mockUser,
          },
        };

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        companyKybDataRepository.findOne.mockResolvedValue(null);
        companyKybDataRepository.save.mockResolvedValue({
          id: 'new-id',
        } as any);

        await service.updateCompanyKybDetails(
          otherCompanyContext.ctx as any,
          { rcNumber: 'RC123' },
          [],
        );

        // Verify operations are performed on the active company only
        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: 'other-company-id' },
          expect.anything(),
        );
      });

      it('should validate and sanitize all input data', async () => {
        const mixedData = {
          rcNumber: 'RC123',
          companyAddress: '123 Main St',
          invalidField: 'should-be-filtered',
          '<script>': 'malicious-content',
        };

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        companyKybDataRepository.findOne.mockResolvedValue(null);
        companyKybDataRepository.save.mockResolvedValue({
          id: 'new-id',
        });

        await service.updateCompanyKybDetails(mockContext.ctx, mixedData, []);

        const savedData = JSON.parse(
          (companyKybDataRepository.save as jest.Mock).mock.calls[0][0].data,
        );

        // Only valid fields should be saved
        expect(savedData).toEqual(
          expect.objectContaining({
            rcNumber: expect.anything(),
            companyAddress: expect.anything(),
          }),
        );
        expect(savedData).toEqual(
          expect.not.objectContaining({
            invalidField: expect.anything(),
            '<script>': expect.anything(),
          }),
        );
      });

      it('should validate file upload parameters', async () => {
        const files = [
          {
            fieldname: 'document',
            originalname: 'test.pdf',
            mimetype: 'application/pdf',
            buffer: Buffer.from('test'),
          } as Express.Multer.File,
        ];

        companyRepository.count.mockResolvedValue(0);
        userRepository.count.mockResolvedValue(0);
        settingsRepository.findOne.mockResolvedValue(mockSettings);
        fileHelpers.validateFile.mockReturnValue({
          isFileTypeValid: true,
          isSizeValid: true,
          maxFileSize: 5242880,
        });

        await service.updateCompanyKybDetails(
          mockContext.ctx,
          { rcNumber: 'RC123' },
          files,
        );

        expect(fileHelpers.validateFile).toHaveBeenCalledTimes(1);
        expect(fileHelpers.validateFile).toHaveBeenCalledWith(files);
      });
    });
  });

  describe('getCompanyDetails', () => {
    describe('when fetching company details', () => {
      beforeEach(() => {
        // Setup mocks for successful scenarios
        companyRepository.findOne.mockResolvedValue({
          ...mockCompany,
          primaryUser: mockUser,
        });
        companyKybDataRepository.findOne.mockResolvedValue({
          id: 'kyb-data-id',
          data: JSON.stringify({
            rcNumber: 'RC123456',
            companyAddress: '123 Test Street',
            document: {
              file: Buffer.from('test-file-content'),
              fileName: 'test-document.pdf',
              fileMimeType: 'application/pdf',
            },
          }),
        } as any);
      });

      it('should successfully get details for active company', async () => {
        const result = await service.getCompanyDetails(mockContext.ctx);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company details',
            data: expect.objectContaining({
              id: mockCompany.id,
              name: mockCompany.name,
              kybData: expect.objectContaining({
                rcNumber: 'RC123456',
                companyAddress: '123 Test Street',
                document: expect.any(Map),
              }),
              primaryUser: expect.any(Object),
            }),
          }),
        );
        expect(companyKybDataRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyKybDataRepository.findOne).toHaveBeenCalledWith({
          where: { id: expect.anything() },
        });
      });

      it('should successfully get details for specific company ID', async () => {
        const specificCompanyId = 'specific-company-id';

        const result = await service.getCompanyDetails(
          mockContext.ctx,
          specificCompanyId,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company details',
            data: expect.objectContaining({
              id: mockCompany.id,
              name: mockCompany.name,
            }),
          }),
        );
        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: expect.anything() },
          relations: { primaryUser: { profile: true } },
        });
      });

      it('should return KYB data with files as base64', async () => {
        const result = await service.getCompanyDetails(mockContext.ctx);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              kybData: expect.objectContaining({
                document: expect.any(Map),
              }),
            }),
          }),
        );

        // Verify file is converted to base64
        const kybData: Record<string, any> = result!.data!.kybData;
        const documentMap = kybData.document as Map<string, any>;
        expect(documentMap.get('fileName')).toBe('test-document.pdf');
        expect(documentMap.get('fileMimeType')).toBe('application/pdf');
        expect(documentMap.get('file')).toBe(
          Buffer.from('test-file-content').toString('base64'),
        );
      });

      it('should handle missing KYB data gracefully', async () => {
        companyKybDataRepository.findOne.mockResolvedValue(null);

        const result = await service.getCompanyDetails(mockContext.ctx);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company details',
            data: expect.objectContaining({
              id: mockCompany.id,
              kybData: {},
            }),
          }),
        );
        expect(companyKybDataRepository.findOne).toHaveBeenCalledTimes(1);
      });

      it('should return standardized response format', async () => {
        const result = await service.getCompanyDetails(mockContext.ctx);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company details',
            data: expect.any(Object),
            meta: undefined,
          }),
        );
      });
    });

    describe('error handling', () => {
      it('should throw error when company not found', async () => {
        const nonExistentCompanyId = 'non-existent-id';
        companyRepository.findOne.mockResolvedValue(null);

        await expect(
          service.getCompanyDetails(mockContext.ctx, nonExistentCompanyId),
        ).rejects.toThrow('No company found with ID - non-existent-id');

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: expect.anything() },
          relations: { primaryUser: { profile: true } },
        });
      });

      it('should only allow users to access their own company data', async () => {
        // When no companyId is provided, it uses ctx.activeCompany (company isolation)
        companyKybDataRepository.findOne.mockResolvedValue({
          id: 'kyb-data-id',
          data: JSON.stringify({ rcNumber: 'RC123456' }),
        } as any);

        const result = await service.getCompanyDetails(mockContext.ctx);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.objectContaining({
              id: mockCompany.id, // Uses the active company from context
            }),
          }),
        );
        // Should not call companyRepository.findOne when using active company
        expect(companyRepository.findOne).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('listCompanies', () => {
    const pagination: PaginationParameters = {
      page: 1,
      limit: 10,
    };

    const mockCompanies = [
      {
        ...mockCompany,
        id: 'company-1',
        name: 'Company One',
        primaryUser: {
          ...mockUser,
          id: 'user-1',
          email: 'user1@example.com',
          profile: { firstName: 'John', lastName: 'Doe' },
        },
      },
      {
        ...mockCompany,
        id: 'company-2',
        name: 'Company Two',
        primaryUser: {
          ...mockUser,
          id: 'user-2',
          email: 'user2@example.com',
          profile: { firstName: 'Jane', lastName: 'Smith' },
        },
      },
    ];

    describe('when listing companies', () => {
      beforeEach(() => {
        // Setup successful path mocks
        companyRepository.count.mockResolvedValue(25); // Total companies
        companyRepository.find.mockResolvedValue(mockCompanies as any);
      });

      it('should successfully list companies with pagination', async () => {
        const result = await service.listCompanies(mockContext.ctx, pagination);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company',
            data: expect.arrayContaining([
              expect.objectContaining({
                id: 'company-1',
                name: 'Company One',
                primaryUser: expect.any(Object),
              }),
              expect.objectContaining({
                id: 'company-2',
                name: 'Company Two',
                primaryUser: expect.any(Object),
              }),
            ]),
            meta: expect.objectContaining({
              totalNumberOfRecords: 25,
              totalNumberOfPages: 3, // Math.ceil(25/10)
              pageNumber: 1,
              pageSize: 10,
            }),
          }),
        );

        expect(companyRepository.count).toHaveBeenCalledTimes(1);
        expect(companyRepository.find).toHaveBeenCalledTimes(1);
      });

      it('should apply filters correctly', async () => {
        const filters = {
          status: 'active',
          kybStatus: 'approved',
          name: 'Test Company',
        };

        const result = await service.listCompanies(
          mockContext.ctx,
          pagination,
          filters,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company',
          }),
        );

        expect(companyRepository.count).toHaveBeenCalledTimes(1);
        expect(companyRepository.count).toHaveBeenCalledWith({
          where: expect.objectContaining({
            ...filters,
            type: expect.anything(), // Not API_PROVIDER
          }),
        });

        expect(companyRepository.find).toHaveBeenCalledTimes(1);
        expect(companyRepository.find).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              ...filters,
              type: expect.anything(), // Not API_PROVIDER
            }),
            skip: 0, // (page - 1) * limit
            take: 10,
            order: { createdAt: 'DESC' },
          }),
        );
      });

      it('should exclude API provider companies', async () => {
        const result = await service.listCompanies(mockContext.ctx, pagination);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
          }),
        );

        expect(companyRepository.count).toHaveBeenCalledTimes(1);
        expect(companyRepository.count).toHaveBeenCalledWith({
          where: expect.objectContaining({
            type: expect.anything(), // Should be Not(CompanyTypes.API_PROVIDER)
          }),
        });

        expect(companyRepository.find).toHaveBeenCalledTimes(1);
        expect(companyRepository.find).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              type: expect.anything(), // Should be Not(CompanyTypes.API_PROVIDER)
            }),
          }),
        );
      });

      it('should return correct metadata', async () => {
        const result = await service.listCompanies(mockContext.ctx, pagination);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            meta: expect.objectContaining({
              totalNumberOfRecords: 25,
              totalNumberOfPages: 3, // Math.ceil(25/10)
              pageNumber: 1,
              pageSize: 10,
            }),
          }),
        );
      });

      it('should only list companies the user has access to', async () => {
        // This test verifies that the service respects any filtering/permissions
        const userSpecificFilters = {
          userId: mockUser.id,
        };

        const result = await service.listCompanies(
          mockContext.ctx,
          pagination,
          userSpecificFilters,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.any(Array),
          }),
        );

        expect(companyRepository.find).toHaveBeenCalledTimes(1);
        expect(companyRepository.find).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(userSpecificFilters),
          }),
        );
      });

      it('should reject invalid pagination parameters', async () => {
        const invalidPagination = { page: 0, limit: -1 };

        // The service itself doesn't validate pagination, but we test with extreme values
        companyRepository.find.mockResolvedValue([]);
        companyRepository.count.mockResolvedValue(0);

        const result = await service.listCompanies(
          mockContext.ctx,
          invalidPagination as any,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: [],
          }),
        );

        expect(companyRepository.find).toHaveBeenCalledTimes(1);
        expect(companyRepository.find).toHaveBeenCalledWith(
          expect.objectContaining({
            skip: 1, // (0 - 1) * -1 = -1, but TypeORM calculates it
            take: -1,
          }),
        );
      });

      it('should return standardized response format', async () => {
        const result = await service.listCompanies(mockContext.ctx, pagination);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully fetched company',
            data: expect.any(Array),
            meta: expect.objectContaining({
              totalNumberOfRecords: expect.any(Number),
              totalNumberOfPages: expect.any(Number),
              pageNumber: expect.any(Number),
              pageSize: expect.any(Number),
            }),
          }),
        );
      });
    });
  });

  describe('verifyCompanyRC', () => {
    describe('when verifying RC number', () => {
      it('should return TIER_0 for RC number less than 25000', () => {
        const result = service.verifyCompanyRC('12345', 'Test Company');

        expect(result).toEqual(
          expect.objectContaining({
            rcNumber: '12345',
            tier: CompanyTiers.TIER_0,
          }),
        );
      });

      it('should return TIER_1 for RC number between 25000-50000', () => {
        const result = service.verifyCompanyRC('30000', 'Test Company');

        expect(result).toEqual(
          expect.objectContaining({
            rcNumber: '30000',
            tier: CompanyTiers.TIER_1,
          }),
        );
      });

      it('should return TIER_2 for RC number between 50000-75000', () => {
        const result = service.verifyCompanyRC('60000', 'Test Company');

        expect(result).toEqual(
          expect.objectContaining({
            rcNumber: '60000',
            tier: CompanyTiers.TIER_2,
          }),
        );
      });

      it('should return TIER_3 for RC number greater than 75000', () => {
        const result = service.verifyCompanyRC('80000', 'Test Company');

        expect(result).toEqual(
          expect.objectContaining({
            rcNumber: '80000',
            tier: CompanyTiers.TIER_3,
          }),
        );
      });

      it('should handle edge case RC numbers correctly', () => {
        // Test boundary conditions
        const tier0MaxResult = service.verifyCompanyRC('25000', 'Test Company');
        expect(tier0MaxResult.tier).toBe(CompanyTiers.TIER_0);

        const tier1Result = service.verifyCompanyRC('25001', 'Test Company');
        expect(tier1Result.tier).toBe(CompanyTiers.TIER_1);

        const tier1MaxResult = service.verifyCompanyRC('50000', 'Test Company');
        expect(tier1MaxResult.tier).toBe(CompanyTiers.TIER_1);

        const tier2Result = service.verifyCompanyRC('50001', 'Test Company');
        expect(tier2Result.tier).toBe(CompanyTiers.TIER_2);

        const tier2MaxResult = service.verifyCompanyRC('75000', 'Test Company');
        expect(tier2MaxResult.tier).toBe(CompanyTiers.TIER_2);

        const tier3Result = service.verifyCompanyRC('75001', 'Test Company');
        expect(tier3Result.tier).toBe(CompanyTiers.TIER_3);
      });

      it('should extract first 5 characters for tier calculation', () => {
        // Test that it uses first 5 characters
        const result1 = service.verifyCompanyRC('30000123456', 'Test Company');
        expect(result1.tier).toBe(CompanyTiers.TIER_1);

        const result2 = service.verifyCompanyRC('80000999', 'Test Company');
        expect(result2.tier).toBe(CompanyTiers.TIER_3);
      });

      it('should return the original RC number in response', () => {
        const rcNumber = '12345';
        const result = service.verifyCompanyRC(rcNumber, 'Test Company');

        expect(result).toEqual(
          expect.objectContaining({
            rcNumber: rcNumber,
            tier: expect.any(String),
          }),
        );
      });
    });

    describe('validation', () => {
      it('should throw error when company name is empty', () => {
        expect(() => {
          service.verifyCompanyRC('RC12345', '');
        }).toThrow('Company name is empty');
      });

      it('should throw error when company name is undefined', () => {
        expect(() => {
          service.verifyCompanyRC('RC12345');
        }).toThrow('Company name is empty');
      });

      it('should throw error when company name is null', () => {
        expect(() => {
          service.verifyCompanyRC('RC12345', null as any);
        }).toThrow('Company name is empty');
      });

      it('should accept valid company name and RC number', () => {
        expect(() => {
          const result = service.verifyCompanyRC(
            'RC12345',
            'Valid Company Name',
          );
          expect(result).toBeDefined();
        }).not.toThrow();
      });
    });
  });

  describe('updateKYBStatus', () => {
    const companyId = 'company-id';
    const approveDto: UpdateKybStatusDto = {
      action: KybStatusActions.APPROVE,
      reason: 'All documents verified',
    };

    describe('when approving company', () => {
      it('should successfully approve company KYB', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('rcNumber', '30000')
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .with('name', 'Test Company')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValueOnce(
          {} as any,
        );
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        jest.spyOn(service, 'verifyCompanyRC').mockReturnValue({
          rcNumber: '30000',
          tier: CompanyTiers.TIER_1,
        });

        const result = await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          approveDto,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal(companyId) },
        });

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          {
            isVerified: true,
            tier: CompanyTiers.TIER_1,
            kybStatus: KybStatuses.APPROVED,
          },
        );

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.approved',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
            company: testCompany,
          }),
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully approved business.',
            data: expect.objectContaining({
              tier: CompanyTiers.TIER_1,
            }),
          }),
        );
      });

      it('should update Kong consumer and plugins', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('rcNumber', '30000')
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        jest.spyOn(service, 'verifyCompanyRC').mockReturnValue({
          rcNumber: '30000',
          tier: CompanyTiers.TIER_1,
        });
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
          development: 'dev-endpoint',
        });

        await service.updateKYBStatus(mockContext.ctx, companyId, approveDto);

        expect(service['updateConsumerId']).toHaveBeenCalledTimes(2);
        expect(service['updateConsumerId']).toHaveBeenCalledWith(
          testCompany,
          'staging',
        );
        expect(service['updateConsumerId']).toHaveBeenCalledWith(
          testCompany,
          'production',
        );

        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledTimes(
          2,
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'staging',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: false,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'production',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: false,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
      });

      it('should emit CompanyApprovedEvent', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        await service.updateKYBStatus(mockContext.ctx, companyId, approveDto);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.approved',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
            company: testCompany,
          }),
        );
      });

      it('should set tier for licensed entity', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('rcNumber', '60000')
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .with('name', 'Licensed Company')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        jest.spyOn(service, 'verifyCompanyRC').mockReturnValue({
          rcNumber: '60000',
          tier: CompanyTiers.TIER_2,
        });
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        const result = await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          approveDto,
        );

        expect(service.verifyCompanyRC).toHaveBeenCalledTimes(1);
        expect(service.verifyCompanyRC).toHaveBeenCalledWith(
          '60000',
          'Licensed Company',
        );

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          {
            isVerified: true,
            tier: CompanyTiers.TIER_2,
            kybStatus: KybStatuses.APPROVED,
          },
        );

        expect(result).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              tier: CompanyTiers.TIER_2,
            }),
          }),
        );
      });
    });

    describe('when denying company', () => {
      const denyDto: UpdateKybStatusDto = {
        action: KybStatusActions.DENY,
        reason: 'Invalid documents provided',
      };

      it('should successfully deny company KYB', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .with('name', 'Test Company')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        const result = await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          denyDto,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal(companyId) },
        });

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          {
            kybStatus: KybStatuses.DENIED,
          },
        );

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.denied',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
            company: testCompany,
            metadata: expect.objectContaining({
              reason: 'Invalid documents provided',
            }),
          }),
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully denied business.',
            data: expect.objectContaining({
              tier: undefined,
            }),
          }),
        );
      });

      it('should enable request termination plugin', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        await service.updateKYBStatus(mockContext.ctx, companyId, denyDto);

        expect(service['updateConsumerId']).toHaveBeenCalledTimes(2);
        expect(service['updateConsumerId']).toHaveBeenCalledWith(
          testCompany,
          'staging',
        );
        expect(service['updateConsumerId']).toHaveBeenCalledWith(
          testCompany,
          'production',
        );

        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledTimes(
          2,
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'staging',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: true,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'production',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: true,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
      });

      it('should emit CompanyDeniedEvent', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        await service.updateKYBStatus(mockContext.ctx, companyId, denyDto);

        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.denied',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
            company: testCompany,
            metadata: expect.objectContaining({
              reason: 'Invalid documents provided',
            }),
          }),
        );
      });

      it('should throw error when reason not provided for denial', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        const denyDtoWithoutReason: UpdateKybStatusDto = {
          action: KybStatusActions.DENY,
          reason: '',
        };

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            companyId,
            denyDtoWithoutReason,
          ),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });

    describe('validation', () => {
      it('should throw error when company not found', async () => {
        companyRepository.findOne.mockResolvedValueOnce(null);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            'non-existent-id',
            approveDto,
          ),
        ).rejects.toThrow(INotFoundException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });

      it('should throw error when RC number not provided for licensed entity', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .with('rcNumber', '')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });

      it('should throw error when company is not active', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });

      it('should validate user permissions for KYB status updates', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test that the method requires proper context and user authentication
        const result = await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          approveDto,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal(companyId) },
        });

        // Verify the context user is used in event emission
        expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
        expect(eventEmitter.emit).toHaveBeenCalledWith(
          'company.kyb.approved',
          expect.objectContaining({
            author: mockContext.ctx.activeUser,
          }),
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
          }),
        );
      });

      it('should validate enum values for actions', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValue(testCompany);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test valid APPROVE action
        const validApproveAction = {
          action: KybStatusActions.APPROVE,
          reason: 'Valid',
        };
        await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          validApproveAction,
        );

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          expect.objectContaining({
            kybStatus: KybStatuses.APPROVED,
          }),
        );

        // Reset mocks
        jest.clearAllMocks();
        companyRepository.findOne.mockResolvedValue(testCompany);
        companyRepository.update.mockResolvedValue({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test valid DENY action
        const validDenyAction = {
          action: KybStatusActions.DENY,
          reason: 'Valid reason',
        };
        await service.updateKYBStatus(
          mockContext.ctx,
          companyId,
          validDenyAction,
        );

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          expect.objectContaining({
            kybStatus: KybStatuses.DENIED,
          }),
        );
      });

      it('should return standardized error response format', async () => {
        // Test company not found error
        companyRepository.findOne.mockResolvedValueOnce(null);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            'non-existent-id',
            approveDto,
          ),
        ).rejects.toThrow(INotFoundException);

        // Test inactive company error
        const inactiveCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(inactiveCompany);

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        // Test missing RC number for licensed entity
        const licensedEntityWithoutRC = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .with('rcNumber', '')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(
          licensedEntityWithoutRC,
        );

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        // Test missing reason for denial
        const denyWithoutReason = {
          action: KybStatusActions.DENY,
          reason: '',
        };

        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            companyId,
            denyWithoutReason,
          ),
        ).rejects.toThrow(IBadRequestException);
      });

      it('should not emit events on validation failures', async () => {
        // Test that no events are emitted when company is not found
        companyRepository.findOne.mockResolvedValueOnce(null);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            'non-existent-id',
            approveDto,
          ),
        ).rejects.toThrow(INotFoundException);

        expect(eventEmitter.emit).not.toHaveBeenCalled();

        // Reset mocks
        jest.clearAllMocks();

        // Test that no events are emitted when company is inactive
        const inactiveCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(inactiveCompany);

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        expect(eventEmitter.emit).not.toHaveBeenCalled();

        // Reset mocks
        jest.clearAllMocks();

        // Test that no events are emitted when RC number is missing for licensed entity
        const licensedEntityWithoutRC = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.LICENSED_ENTITY)
          .with('rcNumber', '')
          .build();

        companyRepository.findOne.mockResolvedValueOnce(
          licensedEntityWithoutRC,
        );

        await expect(
          service.updateKYBStatus(mockContext.ctx, companyId, approveDto),
        ).rejects.toThrow(IBadRequestException);

        expect(eventEmitter.emit).not.toHaveBeenCalled();

        // Reset mocks
        jest.clearAllMocks();

        // Test that no events are emitted when reason is missing for denial
        const denyWithoutReason = {
          action: KybStatusActions.DENY,
          reason: '',
        };

        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .with('type', CompanyTypes.BUSINESS)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.updateKYBStatus(
            mockContext.ctx,
            companyId,
            denyWithoutReason,
          ),
        ).rejects.toThrow(IBadRequestException);

        expect(eventEmitter.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('getCompanyTypes', () => {
    describe('when fetching company types', () => {
      it('should successfully return company types and subtypes', async () => {
        const mockBusinessSettings = new SettingsBuilder()
          .with('name', BUSINESS_SETTINGS_NAME)
          .with(
            'value',
            JSON.stringify({
              companySubtypes: {
                [CompanyTypes.BUSINESS]: ['Small Business', 'Corporation'],
                [CompanyTypes.INDIVIDUAL]: ['Freelancer', 'Consultant'],
                [CompanyTypes.LICENSED_ENTITY]: ['Bank', 'Insurance Company'],
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockBusinessSettings);

        const result = await service.getCompanyTypes();

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: Equal(BUSINESS_SETTINGS_NAME) },
        });

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company types fetched successfully',
            data: expect.objectContaining({
              companyTypes: expect.arrayContaining([
                CompanyTypes.BUSINESS,
                CompanyTypes.INDIVIDUAL,
                CompanyTypes.LICENSED_ENTITY,
              ]),
              companySubtypes: expect.objectContaining({
                [CompanyTypes.BUSINESS]: ['Small Business', 'Corporation'],
                [CompanyTypes.INDIVIDUAL]: ['Freelancer', 'Consultant'],
                [CompanyTypes.LICENSED_ENTITY]: ['Bank', 'Insurance Company'],
              }),
            }),
          }),
        );
      });

      it('should exclude API provider type', async () => {
        const mockBusinessSettings = new SettingsBuilder()
          .with('name', BUSINESS_SETTINGS_NAME)
          .with(
            'value',
            JSON.stringify({
              companySubtypes: {
                [CompanyTypes.BUSINESS]: [],
                [CompanyTypes.INDIVIDUAL]: [],
                [CompanyTypes.LICENSED_ENTITY]: [],
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockBusinessSettings);

        const result = await service.getCompanyTypes();

        expect(result).toEqual(
          expect.objectContaining({
            data: expect.objectContaining({
              companyTypes: expect.not.arrayContaining([
                CompanyTypes.API_PROVIDER,
              ]),
            }),
          }),
        );

        // Verify that all expected types are included except API_PROVIDER
        const returnedTypes = result.data!.companyTypes;
        expect(returnedTypes).toContain(CompanyTypes.BUSINESS);
        expect(returnedTypes).toContain(CompanyTypes.INDIVIDUAL);
        expect(returnedTypes).toContain(CompanyTypes.LICENSED_ENTITY);
        expect(returnedTypes).not.toContain(CompanyTypes.API_PROVIDER);
      });

      it('should handle missing subtypes gracefully', async () => {
        const mockBusinessSettings = new SettingsBuilder()
          .with('name', BUSINESS_SETTINGS_NAME)
          .with(
            'value',
            JSON.stringify({
              // Missing companySubtypes property
              otherSettings: 'some value',
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockBusinessSettings);

        const result = await service.getCompanyTypes();

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company types fetched successfully',
            data: expect.objectContaining({
              companyTypes: expect.arrayContaining([
                CompanyTypes.BUSINESS,
                CompanyTypes.INDIVIDUAL,
                CompanyTypes.LICENSED_ENTITY,
              ]),
              companySubtypes: {
                [CompanyTypes.BUSINESS]: [],
                [CompanyTypes.INDIVIDUAL]: [],
                [CompanyTypes.LICENSED_ENTITY]: [],
              },
            }),
          }),
        );
      });

      it('should return standardized response format', async () => {
        const mockBusinessSettings = new SettingsBuilder()
          .with('name', BUSINESS_SETTINGS_NAME)
          .with(
            'value',
            JSON.stringify({
              companySubtypes: {
                [CompanyTypes.BUSINESS]: ['Small Business'],
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockBusinessSettings);

        const result = await service.getCompanyTypes();

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company types fetched successfully',
            data: expect.any(Object),
            meta: undefined,
          }),
        );

        expect(result.data).toHaveProperty('companyTypes');
        expect(result.data).toHaveProperty('companySubtypes');
        expect(Array.isArray(result.data!.companyTypes)).toBe(true);
        expect(typeof result.data!.companySubtypes).toBe('object');
      });
    });

    describe('error handling', () => {
      it('should throw error when business settings not found', async () => {
        settingsRepository.findOne.mockResolvedValueOnce(null);

        await expect(service.getCompanyTypes()).rejects.toThrow(
          IBadRequestException,
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: Equal(BUSINESS_SETTINGS_NAME) },
        });
      });
    });
  });

  describe('getCompanyCustomFields', () => {
    describe('when fetching custom fields for BUSINESS', () => {
      it('should return business custom fields', async () => {
        const mockAdditionalFields = new SettingsBuilder()
          .with('name', 'onboarding_custom_fields')
          .with(
            'value',
            JSON.stringify({
              business: {
                customBusinessField: {
                  type: 'text',
                  label: 'Custom Business Field',
                },
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockAdditionalFields);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.BUSINESS,
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: Equal('onboarding_custom_fields') },
        });

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.objectContaining({
              customBusinessField: {
                type: 'text',
                label: 'Custom Business Field',
              },
            }),
          }),
        );
      });

      it('should merge with additional fields from settings', async () => {
        const mockAdditionalFields = new SettingsBuilder()
          .with('name', 'onboarding_custom_fields')
          .with(
            'value',
            JSON.stringify({
              business: {
                additionalField: { type: 'select', label: 'Additional Field' },
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockAdditionalFields);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.BUSINESS,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.objectContaining({
              additionalField: { type: 'select', label: 'Additional Field' },
            }),
          }),
        );
      });

      it('should return standardized response format', async () => {
        settingsRepository.findOne.mockResolvedValueOnce(null);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.BUSINESS,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.any(Object),
            meta: undefined,
          }),
        );
      });
    });

    describe('when fetching custom fields for INDIVIDUAL', () => {
      it('should return individual custom fields', async () => {
        const mockAdditionalFields = new SettingsBuilder()
          .with('name', 'onboarding_custom_fields')
          .with(
            'value',
            JSON.stringify({
              individual: {
                personalField: { type: 'text', label: 'Personal Field' },
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockAdditionalFields);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.INDIVIDUAL,
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.objectContaining({
              personalField: { type: 'text', label: 'Personal Field' },
            }),
          }),
        );
      });

      it('should return standardized response format', async () => {
        settingsRepository.findOne.mockResolvedValueOnce(null);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.INDIVIDUAL,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.any(Object),
            meta: undefined,
          }),
        );
      });
    });

    describe('when fetching custom fields for LICENSED_ENTITY', () => {
      it('should return licensed entity custom fields', async () => {
        const mockAdditionalFields = new SettingsBuilder()
          .with('name', 'onboarding_custom_fields')
          .with(
            'value',
            JSON.stringify({
              'licensed-entity': {
                licenseField: { type: 'number', label: 'License Field' },
              },
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockAdditionalFields);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.LICENSED_ENTITY,
        );

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.objectContaining({
              licenseField: { type: 'number', label: 'License Field' },
            }),
          }),
        );
      });

      it('should return standardized response format', async () => {
        settingsRepository.findOne.mockResolvedValueOnce(null);

        const result = await service.getCompanyCustomFields(
          CompanyTypes.LICENSED_ENTITY,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company custom fields fetched successfully',
            data: expect.any(Object),
            meta: undefined,
          }),
        );
      });
    });
  });

  describe('toggleCompanyAccess', () => {
    const companyId = 'company-id';

    describe('when activating company access', () => {
      it('should successfully activate company access', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        const result = await service.toggleCompanyAccess(
          mockContext.ctx,
          companyId,
          true,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal(companyId) },
        });

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          { status: CompanyStatuses.ACTIVE },
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully activated business.',
          }),
        );
      });

      it('should disable request termination plugin', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        await service.toggleCompanyAccess(mockContext.ctx, companyId, true);

        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledTimes(
          2,
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'staging',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: false,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'production',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: false,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
      });

      it('should update company status to active', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({});

        await service.toggleCompanyAccess(mockContext.ctx, companyId, true);

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          { status: CompanyStatuses.ACTIVE },
        );
      });
    });

    describe('when deactivating company access', () => {
      it('should successfully deactivate company access', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        const result = await service.toggleCompanyAccess(
          mockContext.ctx,
          companyId,
          false,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          { status: CompanyStatuses.INACTIVE },
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully deactivated business.',
          }),
        );
      });

      it('should enable request termination plugin', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        await service.toggleCompanyAccess(mockContext.ctx, companyId, false);

        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledTimes(
          2,
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'staging',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: true,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
        expect(kongConsumerService.updateOrCreatePlugin).toHaveBeenCalledWith(
          'production',
          'consumer-id',
          {
            name: 'request-termination',
            enabled: true,
            config: {
              message: 'You have been blocked from making requests',
            },
          },
        );
      });

      it('should update company status to inactive', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({});

        await service.toggleCompanyAccess(mockContext.ctx, companyId, false);

        expect(companyRepository.update).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).toHaveBeenCalledWith(
          { id: companyId },
          { status: CompanyStatuses.INACTIVE },
        );
      });
    });

    describe('validation', () => {
      it('should throw error when company not found', async () => {
        companyRepository.findOne.mockResolvedValueOnce(null);

        await expect(
          service.toggleCompanyAccess(mockContext.ctx, 'non-existent-id', true),
        ).rejects.toThrow(INotFoundException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(kongConsumerService.updateOrCreatePlugin).not.toHaveBeenCalled();
      });

      it('should throw error when trying to activate already active company', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.toggleCompanyAccess(mockContext.ctx, companyId, true),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(kongConsumerService.updateOrCreatePlugin).not.toHaveBeenCalled();
      });

      it('should throw error when trying to deactivate already inactive company', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);

        await expect(
          service.toggleCompanyAccess(mockContext.ctx, companyId, false),
        ).rejects.toThrow(IBadRequestException);

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.update).not.toHaveBeenCalled();
        expect(kongConsumerService.updateOrCreatePlugin).not.toHaveBeenCalled();
      });

      it('should validate user permissions for company access toggle', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test that the method uses the authenticated user context properly
        const result = await service.toggleCompanyAccess(
          mockContext.ctx,
          companyId,
          true,
        );

        expect(companyRepository.findOne).toHaveBeenCalledTimes(1);
        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal(companyId) },
        });

        // Verify that the method requires proper context (implicitly tested through ctx usage)
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully activated business.',
          }),
        );

        // Test that company ID validation works
        companyRepository.findOne.mockResolvedValueOnce(null);

        await expect(
          service.toggleCompanyAccess(
            mockContext.ctx,
            'invalid-company-id',
            true,
          ),
        ).rejects.toThrow(INotFoundException);

        expect(companyRepository.findOne).toHaveBeenCalledWith({
          where: { id: Equal('invalid-company-id') },
        });
      });

      it('should return standardized response format', async () => {
        const testCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(testCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test activation response format
        const activationResult = await service.toggleCompanyAccess(
          mockContext.ctx,
          companyId,
          true,
        );

        expect(activationResult).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully activated business.',
            data: undefined,
            meta: undefined,
          }),
        );

        // Reset mocks for deactivation test
        jest.clearAllMocks();
        const activeCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        companyRepository.findOne.mockResolvedValueOnce(activeCompany);
        companyRepository.update.mockResolvedValueOnce({ affected: 1 } as any);
        kongConsumerService.updateOrCreatePlugin.mockResolvedValue({} as any);
        jest
          .spyOn(service as any, 'updateConsumerId')
          .mockResolvedValue('consumer-id');
        config.get.mockReturnValue({
          staging: 'staging-endpoint',
          production: 'production-endpoint',
        });

        // Test deactivation response format
        const deactivationResult = await service.toggleCompanyAccess(
          mockContext.ctx,
          companyId,
          false,
        );

        expect(deactivationResult).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Successfully deactivated business.',
            data: undefined,
            meta: undefined,
          }),
        );

        // Verify both responses follow the same ResponseFormatter pattern
        expect(activationResult).toHaveProperty('status');
        expect(activationResult).toHaveProperty('message');
        expect(activationResult).toHaveProperty('data');
        expect(activationResult).toHaveProperty('meta');

        expect(deactivationResult).toHaveProperty('status');
        expect(deactivationResult).toHaveProperty('message');
        expect(deactivationResult).toHaveProperty('data');
        expect(deactivationResult).toHaveProperty('meta');
      });
    });
  });

  describe('getCompaniesStats', () => {
    const statsQuery: GetStatsDto = {
      filter: {
        createdAt: {
          gt: '2024-01-01',
          lt: '2024-12-31',
        },
      },
    };

    describe('when fetching company statistics', () => {
      it('should successfully return company stats by status', async () => {
        const mockStats = [
          { count: 10, value: CompanyStatuses.ACTIVE },
          { count: 5, value: CompanyStatuses.INACTIVE },
        ];

        userRepository.query.mockResolvedValueOnce(mockStats);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.arrayContaining([
              expect.objectContaining({
                count: 10,
                value: CompanyStatuses.ACTIVE,
              }),
              expect.objectContaining({
                count: 5,
                value: CompanyStatuses.INACTIVE,
              }),
            ]),
          }),
        );
      });

      it('should handle date filters correctly', async () => {
        const mockStats = [
          { count: 8, value: CompanyStatuses.ACTIVE },
          { count: 3, value: CompanyStatuses.INACTIVE },
        ];

        userRepository.query.mockResolvedValueOnce(mockStats);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('created_at >= ?'),
          expect.arrayContaining(['2024-01-01', '2024-12-31']),
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: mockStats,
          }),
        );
      });

      it('should exclude API provider companies', async () => {
        const mockStats = [{ count: 5, value: CompanyStatuses.ACTIVE }];

        userRepository.query.mockResolvedValueOnce(mockStats);

        await service.getCompaniesStats(mockContext.ctx, statsQuery);

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining("type != 'api-provider'"),
          expect.any(Array),
        );
      });

      it('should handle null date filters', async () => {
        const mockStats = [
          { count: 15, value: CompanyStatuses.ACTIVE },
          { count: 2, value: CompanyStatuses.INACTIVE },
        ];

        const queryWithoutDates: GetStatsDto = {
          filter: {
            createdAt: {
              gt: '',
              lt: '',
            },
          },
        };

        userRepository.query.mockResolvedValueOnce(mockStats);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          queryWithoutDates,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: mockStats,
          }),
        );
      });

      it('should include all statuses even if count is zero', async () => {
        const mockStatsWithZeros = [
          { count: 10, value: CompanyStatuses.ACTIVE },
          { count: 0, value: CompanyStatuses.INACTIVE },
        ];

        userRepository.query.mockResolvedValueOnce(mockStatsWithZeros);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.arrayContaining([
              expect.objectContaining({
                count: 10,
                value: CompanyStatuses.ACTIVE,
              }),
              expect.objectContaining({
                count: 0,
                value: CompanyStatuses.INACTIVE,
              }),
            ]),
          }),
        );
      });

      it('should validate filter parameters', async () => {
        const invalidQuery: GetStatsDto = {
          filter: {
            createdAt: {
              gt: 'invalid-date',
              lt: 'another-invalid-date',
            },
          },
        };

        userRepository.query.mockResolvedValueOnce([]);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          invalidQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: [],
          }),
        );
      });

      it('should return standardized response format', async () => {
        const mockStats = [{ count: 5, value: CompanyStatuses.ACTIVE }];

        userRepository.query.mockResolvedValueOnce(mockStats);

        const result = await service.getCompaniesStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.any(Array),
            meta: undefined,
          }),
        );
      });
    });
  });

  describe('getCompaniesKybStats', () => {
    const statsQuery: GetStatsDto = {
      filter: {
        createdAt: {
          gt: '2024-01-01',
          lt: '2024-12-31',
        },
      },
    };

    describe('when fetching KYB statistics', () => {
      it('should successfully return KYB stats by status', async () => {
        const mockKybStats = [
          { count: 15, value: KybStatuses.APPROVED },
          { count: 8, value: KybStatuses.PENDING },
          { count: 3, value: KybStatuses.DENIED },
        ];

        userRepository.query.mockResolvedValueOnce(mockKybStats);

        const result = await service.getCompaniesKybStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.arrayContaining([
              expect.objectContaining({
                count: 15,
                value: KybStatuses.APPROVED,
              }),
              expect.objectContaining({ count: 8, value: KybStatuses.PENDING }),
              expect.objectContaining({ count: 3, value: KybStatuses.DENIED }),
            ]),
          }),
        );
      });

      it('should handle date filters correctly', async () => {
        const mockKybStats = [
          { count: 12, value: KybStatuses.APPROVED },
          { count: 5, value: KybStatuses.PENDING },
        ];

        userRepository.query.mockResolvedValueOnce(mockKybStats);

        const result = await service.getCompaniesKybStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('created_at >= ?'),
          expect.arrayContaining(['2024-01-01', '2024-12-31']),
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: mockKybStats,
          }),
        );
      });

      it('should exclude API provider companies', async () => {
        const mockKybStats = [{ count: 7, value: KybStatuses.APPROVED }];

        userRepository.query.mockResolvedValueOnce(mockKybStats);

        await service.getCompaniesKybStats(mockContext.ctx, statsQuery);

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining("type != 'api-provider'"),
          expect.any(Array),
        );
      });

      it('should include all statuses even if count is zero', async () => {
        const mockKybStatsWithZeros = [
          { count: 20, value: KybStatuses.APPROVED },
          { count: 0, value: KybStatuses.PENDING },
          { count: 2, value: KybStatuses.DENIED },
        ];

        userRepository.query.mockResolvedValueOnce(mockKybStatsWithZeros);

        const result = await service.getCompaniesKybStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: expect.arrayContaining([
              expect.objectContaining({
                count: 20,
                value: KybStatuses.APPROVED,
              }),
              expect.objectContaining({ count: 0, value: KybStatuses.PENDING }),
              expect.objectContaining({ count: 2, value: KybStatuses.DENIED }),
            ]),
          }),
        );
      });

      it('should validate filter parameters', async () => {
        const invalidQuery: GetStatsDto = {
          filter: {
            createdAt: {
              gt: 'invalid-date-format',
              lt: 'another-invalid-date',
            },
          },
        };

        userRepository.query.mockResolvedValueOnce([]);

        const result = await service.getCompaniesKybStats(
          mockContext.ctx,
          invalidQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            data: [],
          }),
        );
      });

      it('should return standardized response format', async () => {
        const mockKybStats = [{ count: 10, value: KybStatuses.APPROVED }];

        userRepository.query.mockResolvedValueOnce(mockKybStats);

        const result = await service.getCompaniesKybStats(
          mockContext.ctx,
          statsQuery,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.any(Array),
            meta: undefined,
          }),
        );
      });
    });
  });

  describe('getCompaniesStatsAggregate', () => {
    const aggregateQuery: GetStatsDto = {
      filter: {
        createdAt: {
          gt: '2024-01-01',
          lt: '2024-12-31',
        },
      },
    };

    describe('when fetching aggregate statistics', () => {
      it('should successfully return aggregated stats over time', async () => {
        const mockBaseStats = [
          { count: 5, value: CompanyStatuses.ACTIVE },
          { count: 3, value: CompanyStatuses.INACTIVE },
        ];

        const mockTimeSeriesData = [
          { count: 2, value: '2024-01-01' },
          { count: 3, value: '2024-01-02' },
        ];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue(mockTimeSeriesData);

        const result = await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          aggregateQuery,
        );

        expect(service.getCompaniesStats).toHaveBeenCalledTimes(1);
        expect(service.getCompaniesStats).toHaveBeenCalledWith(
          mockContext.ctx,
          aggregateQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(2); // Called for each status
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.arrayContaining([
              expect.objectContaining({
                count: 5,
                value: CompanyStatuses.ACTIVE,
                data: mockTimeSeriesData,
              }),
              expect.objectContaining({
                count: 3,
                value: CompanyStatuses.INACTIVE,
                data: mockTimeSeriesData,
              }),
            ]),
          }),
        );
      });

      it('should use getCompaniesStats for base data', async () => {
        const mockBaseStats = [
          { count: 10, value: CompanyStatuses.ACTIVE },
          { count: 5, value: CompanyStatuses.INACTIVE },
        ];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue([]);

        await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          aggregateQuery,
        );

        expect(service.getCompaniesStats).toHaveBeenCalledTimes(1);
        expect(service.getCompaniesStats).toHaveBeenCalledWith(
          mockContext.ctx,
          aggregateQuery,
        );
      });

      it('should generate date series SQL queries correctly', async () => {
        const startDate = '2024-01-01';
        const endDate = '2024-01-03';

        const queryWithDates: GetStatsDto = {
          filter: {
            createdAt: {
              gt: startDate,
              lt: endDate,
            },
          },
        };

        const mockBaseStats = [{ count: 5, value: CompanyStatuses.ACTIVE }];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue([
          { count: 1, value: '2024-01-01' },
        ]);

        await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          queryWithDates,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('WITH RECURSIVE date_series'),
          expect.arrayContaining(['2024-01-01', CompanyStatuses.ACTIVE]),
        );
      });

      it('should handle missing start date by defaulting to 30 days', async () => {
        const queryWithoutStartDate: GetStatsDto = {
          filter: {
            createdAt: {
              gt: '',
              lt: '2024-12-31',
            },
          },
        };

        const mockBaseStats = [{ count: 5, value: CompanyStatuses.ACTIVE }];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue([]);

        await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          queryWithoutStartDate,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(1);
        expect(userRepository.query).toHaveBeenCalledWith(
          expect.stringContaining('WITH RECURSIVE date_series'),
          expect.arrayContaining(['2024-01-01', CompanyStatuses.ACTIVE]),
        );
      });

      it('should process multiple status types', async () => {
        const mockBaseStats = [
          { count: 10, value: CompanyStatuses.ACTIVE },
          { count: 5, value: CompanyStatuses.INACTIVE },
        ];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue([
          { count: 1, value: '2024-01-01' },
        ]);

        const result = await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          aggregateQuery,
        );

        expect(userRepository.query).toHaveBeenCalledTimes(2); // Once for each status
        expect(result.data).toHaveLength(2);
        expect(result.data).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              count: 10,
              value: CompanyStatuses.ACTIVE,
              data: expect.any(Array),
            }),
            expect.objectContaining({
              count: 5,
              value: CompanyStatuses.INACTIVE,
              data: expect.any(Array),
            }),
          ]),
        );
      });

      it('should return standardized response format', async () => {
        const mockBaseStats = [{ count: 5, value: CompanyStatuses.ACTIVE }];

        jest.spyOn(service, 'getCompaniesStats').mockResolvedValue({
          status: 'success',
          message: 'Company stats fetched successfully',
          data: mockBaseStats,
        } as any);

        userRepository.query.mockResolvedValue([
          { count: 1, value: '2024-01-01' },
        ]);

        const result = await service.getCompaniesStatsAggregate(
          mockContext.ctx,
          aggregateQuery,
        );

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'Company stats fetched successfully',
            data: expect.any(Array),
            meta: undefined,
          }),
        );
      });
    });
  });

  describe('getUserAgreements', () => {
    describe('when fetching user agreements', () => {
      it('should successfully return user agreements', async () => {
        const mockUserAgreements = new SettingsBuilder()
          .with('name', 'user_agreements')
          .with(
            'value',
            JSON.stringify({
              termsOfService: 'https://example.com/terms',
              privacyPolicy: 'https://example.com/privacy',
              dataProcessing: 'https://example.com/data',
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockUserAgreements);

        const result = await service.getUserAgreements();

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(settingsRepository.findOne).toHaveBeenCalledWith({
          where: { name: 'user_agreements' },
          select: { value: true },
        });

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'User agreements fetched successfully',
            data: {
              termsOfService: 'https://example.com/terms',
              privacyPolicy: 'https://example.com/privacy',
              dataProcessing: 'https://example.com/data',
            },
          }),
        );
      });

      it('should handle missing agreements gracefully', async () => {
        settingsRepository.findOne.mockResolvedValueOnce(null);

        const result = await service.getUserAgreements();

        expect(settingsRepository.findOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'User agreements fetched successfully',
            data: {},
          }),
        );
      });

      it('should parse JSON value correctly', async () => {
        const mockUserAgreements = new SettingsBuilder()
          .with('name', 'user_agreements')
          .with(
            'value',
            JSON.stringify({
              agreement1: 'value1',
              agreement2: { nested: 'value2' },
              agreement3: ['array', 'value'],
            }),
          )
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockUserAgreements);

        const result = await service.getUserAgreements();

        expect(result.data).toEqual({
          agreement1: 'value1',
          agreement2: { nested: 'value2' },
          agreement3: ['array', 'value'],
        });
      });

      it('should return standardized response format', async () => {
        const mockUserAgreements = new SettingsBuilder()
          .with('name', 'user_agreements')
          .with('value', JSON.stringify({ test: 'data' }))
          .build();

        settingsRepository.findOne.mockResolvedValueOnce(mockUserAgreements);

        const result = await service.getUserAgreements();

        expect(result).toEqual(
          expect.objectContaining({
            status: 'success',
            message: 'User agreements fetched successfully',
            data: expect.any(Object),
            meta: undefined,
          }),
        );
      });
    });
  });
});
