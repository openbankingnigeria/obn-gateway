import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import {
  Company,
  Settings,
  User,
  CompanyKybData,
  CompanyStatuses,
  KybStatuses,
  UserStatuses,
} from '@common/database/entities';
import {
  CompanyBuilder,
  UserBuilder,
  SettingsBuilder,
} from '@test/utils/builders';
import {
  createMockRepository,
  MockRepository,
  mockEventEmitter,
  createMockContext,
} from '@test/utils/mocks';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { KongConsumerService } from '@shared/integrations/kong/consumer/consumer.kong.service';
import { FileHelpers } from '@common/utils/helpers/file.helpers';
import {
  UpdateKybStatusDto,
  GetStatsDto,
  KybStatusActions,
} from './dto/index.dto';
import { IBadRequestException, INotFoundException } from '@common/utils/exceptions/exceptions';
import { ResponseFormatter } from '@common/utils/response/response.formatter';
import { CompanyTypes } from '@common/database/constants';
import { CompanyTiers } from './types';
import { BUSINESS_SETTINGS_NAME } from 'src/settings/settings.constants';
import { RequestContext } from '@common/utils/request/request-context';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { CompanyEvents } from '@shared/events/company.event';
import moment from 'moment';

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
      if (key === 'kong.adminEndpoint') return {
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
        { provide: 'CompanyKybDataRepository', useValue: companyKybDataRepository },
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
      it('should successfully update company KYB details', async () => {
        // TODO: Implement test
      });

      it('should create new KYB data if none exists', async () => {
        // TODO: Implement test
      });

      it('should update existing KYB data if it exists', async () => {
        // TODO: Implement test
      });

      it('should handle file uploads correctly', async () => {
        // TODO: Implement test
      });

      it('should emit CompanyKybSubmittedEvent', async () => {
        // TODO: Test event emission for KYB submission
      });

      it('should return standardized success response format', async () => {
        // TODO: Test ResponseFormatter usage in success scenarios
      });

      it('should only accept valid fields from request payload', async () => {
        // TODO: Test that only valid fields are processed and stored
      });

      it('should set KYB status to PENDING after successful update', async () => {
        // TODO: Test KYB status update to PENDING
      });

      it('should update company KYB data ID after KYB data creation', async () => {
        // TODO: Test company.kybDataId update
      });

      it('should update user account number when provided', async () => {
        // TODO: Test user.accountNumber update
      });

      it('should merge new KYB data with existing data', async () => {
        // TODO: Test KYB data merging logic
      });
    });

    describe('validation', () => {
      it('should throw error when company is already verified', async () => {
        // TODO: Implement test
      });

      it('should throw error when RC number already exists', async () => {
        // TODO: Implement test
      });

      it('should throw error when account number already exists', async () => {
        // TODO: Implement test
      });

      it('should throw error when business settings not found', async () => {
        // TODO: Implement test
      });

      it('should throw error when file type is invalid', async () => {
        // TODO: Implement test
      });

      it('should throw error when file size exceeds limit', async () => {
        // TODO: Implement test
      });

      it('should throw error when field length exceeds limit', async () => {
        // TODO: Implement test
      });

      it('should only allow users to update their own company KYB details', async () => {
        // TODO: Test company isolation - user can only update their own company
      });

      it('should validate and sanitize all input data', async () => {
        // TODO: Test comprehensive input validation and sanitization
      });

      it('should validate file upload parameters', async () => {
        // TODO: Test file validation parameters
      });
    });
  });

  describe('getCompanyDetails', () => {
    describe('when fetching company details', () => {
      it('should successfully get details for active company', async () => {
        // TODO: Implement test
      });

      it('should successfully get details for specific company ID', async () => {
        // TODO: Implement test
      });

      it('should return KYB data with files as base64', async () => {
        // TODO: Implement test
      });

      it('should handle missing KYB data gracefully', async () => {
        // TODO: Implement test
      });
    });

    describe('error handling', () => {
      it('should throw error when company not found', async () => {
        // TODO: Implement test
      });

      it('should only allow users to access their own company data', async () => {
        // TODO: Test company isolation - user can only access their own company
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });
  });

  describe('listCompanies', () => {
    const pagination: PaginationParameters = {
      page: 1,
      limit: 10,
    };

    describe('when listing companies', () => {
      it('should successfully list companies with pagination', async () => {
        // TODO: Implement test
      });

      it('should apply filters correctly', async () => {
        // TODO: Implement test
      });

      it('should exclude API provider companies', async () => {
        // TODO: Implement test
      });

      it('should return correct metadata', async () => {
        // TODO: Implement test
      });

      it('should only list companies the user has access to', async () => {
        // TODO: Test company filtering based on user permissions
      });

      it('should reject invalid pagination parameters', async () => {
        // TODO: Test pagination parameter validation
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });
  });

  describe('verifyCompanyRC', () => {
    describe('when verifying RC number', () => {
      it('should return TIER_0 for RC number less than 25000', async () => {
        // TODO: Implement test
      });

      it('should return TIER_1 for RC number between 25000-50000', async () => {
        // TODO: Implement test
      });

      it('should return TIER_2 for RC number between 50000-75000', async () => {
        // TODO: Implement test
      });

      it('should return TIER_3 for RC number greater than 75000', async () => {
        // TODO: Implement test
      });
    });

    describe('validation', () => {
      it('should throw error when company name is empty', async () => {
        // TODO: Implement test
      });
    });
  });

  describe('updateKYBStatus', () => {
    const companyId = 'company-id';

    describe('when approving company', () => {
      const approveDto: UpdateKybStatusDto = {
        action: KybStatusActions.APPROVE,
        reason: 'All documents verified',
      };

      it('should successfully approve company KYB', async () => {
        // TODO: Implement test
      });

      it('should update Kong consumer and plugins', async () => {
        // TODO: Implement test
      });

      it('should emit CompanyApprovedEvent', async () => {
        // TODO: Test event emission for company approval
      });

      it('should set tier for licensed entity', async () => {
        // TODO: Implement test
      });
    });

    describe('when denying company', () => {
      const denyDto: UpdateKybStatusDto = {
        action: KybStatusActions.DENY,
        reason: 'Invalid documents provided',
      };

      it('should successfully deny company KYB', async () => {
        // TODO: Implement test
      });

      it('should enable request termination plugin', async () => {
        // TODO: Implement test
      });

      it('should emit CompanyDeniedEvent', async () => {
        // TODO: Test event emission for company denial
      });

      it('should throw error when reason not provided for denial', async () => {
        // TODO: Implement test
      });
    });

    describe('validation', () => {
      it('should throw error when company not found', async () => {
        // TODO: Implement test
      });

      it('should throw error when RC number not provided for licensed entity', async () => {
        // TODO: Implement test
      });

      it('should throw error when company is not active', async () => {
        // TODO: Implement test
      });

      it('should validate user permissions for KYB status updates', async () => {
        // TODO: Test permission validation
      });

      it('should validate enum values for actions', async () => {
        // TODO: Test enum validation for KybStatusActions
      });

      it('should return standardized error response format', async () => {
        // TODO: Test ResponseFormatter usage in error scenarios
      });

      it('should not emit events on validation failures', async () => {
        // TODO: Test that events are not emitted when validation fails
      });
    });
  });

  describe('getCompanyTypes', () => {
    describe('when fetching company types', () => {
      it('should successfully return company types and subtypes', async () => {
        // TODO: Implement test
      });

      it('should exclude API provider type', async () => {
        // TODO: Implement test
      });

      it('should handle missing subtypes gracefully', async () => {
        // TODO: Implement test
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });

    describe('error handling', () => {
      it('should throw error when business settings not found', async () => {
        // TODO: Implement test
      });
    });
  });

  describe('getCompanyCustomFields', () => {
    describe('when fetching custom fields for BUSINESS', () => {
      it('should return business custom fields', async () => {
        // TODO: Implement test
      });

      it('should merge with additional fields from settings', async () => {
        // TODO: Implement test
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });

    describe('when fetching custom fields for INDIVIDUAL', () => {
      it('should return individual custom fields', async () => {
        // TODO: Implement test
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });

    describe('when fetching custom fields for LICENSED_ENTITY', () => {
      it('should return licensed entity custom fields', async () => {
        // TODO: Implement test
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });
  });

  describe('toggleCompanyAccess', () => {
    const companyId = 'company-id';

    describe('when activating company access', () => {
      it('should successfully activate company access', async () => {
        // TODO: Implement test
      });

      it('should disable request termination plugin', async () => {
        // TODO: Implement test
      });

      it('should update company status to active', async () => {
        // TODO: Implement test
      });
    });

    describe('when deactivating company access', () => {
      it('should successfully deactivate company access', async () => {
        // TODO: Implement test
      });

      it('should enable request termination plugin', async () => {
        // TODO: Implement test
      });

      it('should update company status to inactive', async () => {
        // TODO: Implement test
      });
    });

    describe('validation', () => {
      it('should throw error when company not found', async () => {
        // TODO: Implement test
      });

      it('should throw error when trying to activate already active company', async () => {
        // TODO: Implement test
      });

      it('should throw error when trying to deactivate already inactive company', async () => {
        // TODO: Implement test
      });

      it('should validate user permissions for company access toggle', async () => {
        // TODO: Test permission validation
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
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
        // TODO: Implement test
      });

      it('should handle date filters correctly', async () => {
        // TODO: Implement test
      });

      it('should exclude API provider companies', async () => {
        // TODO: Implement test
      });

      it('should handle null date filters', async () => {
        // TODO: Implement test
      });

      it('should include all statuses even if count is zero', async () => {
        // TODO: Test zero-count status scenarios
      });

      it('should validate filter parameters', async () => {
        // TODO: Test filter parameter validation
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
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
        // TODO: Implement test
      });

      it('should handle date filters correctly', async () => {
        // TODO: Implement test
      });

      it('should exclude API provider companies', async () => {
        // TODO: Implement test
      });

      it('should include all statuses even if count is zero', async () => {
        // TODO: Test zero-count status scenarios
      });

      it('should validate filter parameters', async () => {
        // TODO: Test filter parameter validation
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
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
        // TODO: Implement test
      });

      it('should use getCompaniesStats for base data', async () => {
        // TODO: Implement test
      });

      it('should generate date series correctly', async () => {
        // TODO: Implement test
      });

      it('should handle missing start date by defaulting to 30 days', async () => {
        // TODO: Implement test
      });

      it('should validate filter parameters', async () => {
        // TODO: Test filter parameter validation for aggregate queries
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });
  });

  describe('getUserAgreements', () => {
    describe('when fetching user agreements', () => {
      it('should successfully return user agreements', async () => {
        // TODO: Implement test
      });

      it('should handle missing agreements gracefully', async () => {
        // TODO: Implement test
      });

      it('should parse JSON value correctly', async () => {
        // TODO: Implement test
      });

      it('should return standardized response format', async () => {
        // TODO: Test ResponseFormatter usage
      });
    });
  });
});
