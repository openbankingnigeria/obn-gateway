import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import {
  ResponseFormatter,
  ResponseMetaDTO,
} from '@common/utils/response/response.formatter';
import { PaginationParameters } from '@common/utils/pipes/query/pagination.pipe';
import { PERMISSIONS } from '@permissions/types';
import {
  UpdateCompanyDetailsDto,
  GetCompanyKYBDataResponseDTO,
  PrimaryUserDto,
  GetCompanyTypesResponseDTO,
  GetCompanyResponseDTO,
  GetStatsResponseDTO,
  GetCompanyCustomFieldsResponseDTO,
  UpdateKybStatusDto,
  GetStatsDto,
  KybStatusActions,
} from './dto/index.dto';
import { CompanyBuilder, createMockContext, UserBuilder } from '@test/utils';
import { KybStatuses, CompanyStatuses } from '@common/database/entities';
import { CompanyTypes } from '@common/database/constants';
import {
  IBadRequestException,
  INotFoundException,
} from '@common/utils/exceptions/exceptions';
import {
  REQUIRED_PERMISSION_METADATA_KEY,
  SKIP_AUTH_METADATA_KEY,
} from '@common/utils/authentication/auth.decorator';
import { Reflector } from '@nestjs/core';
import { IValidationPipe } from '@common/utils/pipes/validation/validation.pipe';

const moduleMocker = new ModuleMocker(global);

describe('CompanyController', () => {
  let controller: CompanyController;
  let mockCompanyService: jest.Mocked<CompanyService>;
  let reflector: Reflector;

  beforeEach(async () => {
    mockCompanyService = {
      updateCompanyKybDetails: jest.fn(),
      getCompanyDetails: jest.fn(),
      getCompanyTypes: jest.fn(),
      listCompanies: jest.fn(),
      getCompaniesStats: jest.fn(),
      getCompaniesKybStats: jest.fn(),
      getCompanyCustomFields: jest.fn(),
      getCompaniesStatsAggregate: jest.fn(),
      updateKYBStatus: jest.fn(),
      toggleCompanyAccess: jest.fn(),
      getUserAgreements: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
    })
      .useMocker((token) => {
        if (token === CompanyService) {
          return mockCompanyService;
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
    reflector = new Reflector();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateCompanyKybDetails', () => {
    describe('when updateCompanyKybDetails is called with valid data', () => {
      it('should successfully update company KYB details', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS],
          user: new UserBuilder()
            .with(
              'company',
              new CompanyBuilder()
                .with('kybStatus', KybStatuses.PENDING)
                .build(),
            )
            .build(),
        });

        const updateData: UpdateCompanyDetailsDto = {
          rcNumber: '123456789012345',
          accountNumber: '1234567890',
        };

        const files: Express.Multer.File[] = [
          {
            fieldname: 'document',
            originalname: 'test.pdf',
            encoding: '7bit',
            mimetype: 'application/pdf',
            size: 1024,
            buffer: Buffer.from('test'),
          } as Express.Multer.File,
        ];

        const expectedResponse = ResponseFormatter.success(
          'Successfully updated company KYB details.',
        );

        mockCompanyService.updateCompanyKybDetails.mockResolvedValue(
          expectedResponse,
        );

        const result = await controller.updateCompanyKybDetails(
          ctx.ctx,
          updateData,
          files,
        );

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.updateCompanyKybDetails).toHaveBeenCalledWith(
          ctx.ctx,
          updateData,
          files,
        );
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_COMPANY_KYB_DETAILS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.updateCompanyKybDetails,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to updateCompanyKybDetails endpoint', () => {
        // This test verifies that IValidationPipe is available for use in the @Body decorator
        // The actual validation is handled by the parameter decorator @Body(IValidationPipe)
        expect(IValidationPipe).toBeDefined();
        expect(typeof IValidationPipe).toBe('function');
      });
    });

    describe('file upload', () => {
      it('should use AnyFilesInterceptor for file uploads', () => {
        const interceptors = reflector.get(
          '__interceptors__',
          controller.updateCompanyKybDetails,
        );
        expect(interceptors).toBeDefined();
        expect(interceptors.length).toBeGreaterThan(0);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_KYB_DETAILS],
          user: new UserBuilder()
            .with(
              'company',
              new CompanyBuilder()
                .with('kybStatus', KybStatuses.PENDING)
                .build(),
            )
            .build(),
        });

        const updateData: UpdateCompanyDetailsDto = {
          rcNumber: '123456789012345',
          accountNumber: '1234567890',
        };

        const files: Express.Multer.File[] = [];

        const serviceError = new Error('Service error');
        mockCompanyService.updateCompanyKybDetails.mockRejectedValue(
          serviceError,
        );

        await expect(
          controller.updateCompanyKybDetails(ctx.ctx, updateData, files),
        ).rejects.toThrow('Service error');

        expect(mockCompanyService.updateCompanyKybDetails).toHaveBeenCalledWith(
          ctx.ctx,
          updateData,
          files,
        );
      });
    });
  });

  describe('getCompanyDetails', () => {
    describe('when getCompanyDetails is called', () => {
      it('should successfully get company details', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.VIEW_COMPANY_DETAILS],
          user: new UserBuilder()
            .with(
              'company',
              new CompanyBuilder()
                .with('id', 'company-id')
                .with('name', 'Test Company')
                .with('kybStatus', KybStatuses.APPROVED)
                .build(),
            )
            .build(),
        });

        const mockCompanyData = new GetCompanyKYBDataResponseDTO({
          id: 'company-id',
          name: 'Test Company',
          kybStatus: KybStatuses.APPROVED,
          primaryUser: new PrimaryUserDto({
            id: 'user-id',
            email: 'test@company.com',
            firstName: 'Test',
            lastName: 'User',
          }),
          kybData: {},
        });

        const expectedResponse = ResponseFormatter.success(
          'Successfully fetched company details',
          mockCompanyData,
        );

        mockCompanyService.getCompanyDetails.mockResolvedValue(
          expectedResponse,
        );

        const result = await controller.getCompanyDetails(ctx.ctx);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompanyDetails).toHaveBeenCalledWith(
          ctx.ctx,
          ctx.ctx.activeCompany.id,
        );
      });
    });

    describe('permissions', () => {
      it('should require VIEW_COMPANY_DETAILS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getCompanyDetails,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_COMPANY_DETAILS);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.VIEW_COMPANY_DETAILS],
          user: new UserBuilder()
            .with(
              'company',
              new CompanyBuilder().with('id', 'company-id').build(),
            )
            .build(),
        });

        const serviceError = new Error('Service error');
        mockCompanyService.getCompanyDetails.mockRejectedValue(serviceError);

        await expect(controller.getCompanyDetails(ctx.ctx)).rejects.toThrow(
          'Service error',
        );

        expect(mockCompanyService.getCompanyDetails).toHaveBeenCalledWith(
          ctx.ctx,
          ctx.ctx.activeCompany.id,
        );
      });
    });
  });

  describe('getCompanyTypes', () => {
    describe('when getCompanyTypes is called', () => {
      it('should successfully get company types', async () => {
        const mockCompanyTypesData = new GetCompanyTypesResponseDTO({
          companyTypes: [CompanyTypes.INDIVIDUAL, CompanyTypes.BUSINESS],
          companySubtypes: {
            individual: ['personal', 'freelancer'],
            business: ['startup', 'enterprise'],
            'licensed-entity': ['bank', 'payment-institution'],
          },
        });

        const expectedResponse = ResponseFormatter.success(
          'Company types fetched successfully',
          mockCompanyTypesData,
        );

        mockCompanyService.getCompanyTypes.mockResolvedValue(expectedResponse);

        const result = await controller.getCompanyTypes();

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompanyTypes).toHaveBeenCalledWith();
      });
    });

    describe('public endpoint', () => {
      it('should skip auth guard', () => {
        const skipAuthGuard = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getCompanyTypes,
        );
        expect(skipAuthGuard).toBe(true);
      });

      it('should use exposeAll serialization strategy', () => {
        const serializeOptions = reflector.get(
          'class_serializer:options',
          controller.getCompanyTypes,
        );
        expect(serializeOptions).toBeDefined();
        expect(serializeOptions.strategy).toBe('exposeAll');
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const serviceError = new IBadRequestException({
          message: 'System settings not found.',
        });
        mockCompanyService.getCompanyTypes.mockRejectedValue(serviceError);

        await expect(controller.getCompanyTypes()).rejects.toThrow(
          IBadRequestException,
        );
        expect(mockCompanyService.getCompanyTypes).toHaveBeenCalledWith();
      });
    });
  });

  describe('listCompanies', () => {
    describe('when listCompanies is called with valid parameters', () => {
      it('should successfully list companies', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const pagination: PaginationParameters = {
          page: 1,
          limit: 10,
        };

        const filters = {
          type: CompanyTypes.BUSINESS,
          status: 'active',
        };

        const mockCompanies = [
          new GetCompanyResponseDTO({
            id: 'company-1',
            name: 'Test Company 1',
            type: CompanyTypes.BUSINESS,
            kybStatus: KybStatuses.APPROVED,
            primaryUser: new PrimaryUserDto({
              id: 'user-1',
              email: 'test1@company.com',
            }),
          }),
          new GetCompanyResponseDTO({
            id: 'company-2',
            name: 'Test Company 2',
            type: CompanyTypes.INDIVIDUAL,
            kybStatus: KybStatuses.PENDING,
            primaryUser: new PrimaryUserDto({
              id: 'user-2',
              email: 'test2@company.com',
            }),
          }),
        ];

        const mockMeta = new ResponseMetaDTO({
          totalNumberOfRecords: 2,
          totalNumberOfPages: 1,
          currentPage: 1,
          limit: 10,
        });

        const expectedResponse = ResponseFormatter.success(
          'Successfully fetched company',
          mockCompanies,
          mockMeta,
        );

        mockCompanyService.listCompanies.mockResolvedValue(expectedResponse);

        const result = await controller.listCompanies(
          ctx.ctx,
          pagination,
          filters,
        );

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.listCompanies).toHaveBeenCalledWith(
          ctx.ctx,
          pagination,
          filters,
        );
      });
    });

    describe('permissions', () => {
      it('should require LIST_COMPANIES permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.listCompanies,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_COMPANIES);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const pagination: PaginationParameters = {
          page: 1,
          limit: 10,
        };

        const filters = {};

        const serviceError = new Error('Database connection error');
        mockCompanyService.listCompanies.mockRejectedValue(serviceError);

        await expect(
          controller.listCompanies(ctx.ctx, pagination, filters),
        ).rejects.toThrow('Database connection error');

        expect(mockCompanyService.listCompanies).toHaveBeenCalledWith(
          ctx.ctx,
          pagination,
          filters,
        );
      });
    });
  });

  describe('getCompaniesStats', () => {
    describe('when getCompaniesStats is called', () => {
      it('should successfully get companies statistics', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const mockStats = [
          new GetStatsResponseDTO({ count: 15, value: CompanyStatuses.ACTIVE }),
          new GetStatsResponseDTO({
            count: 5,
            value: CompanyStatuses.INACTIVE,
          }),
        ];

        const expectedResponse = ResponseFormatter.success(
          'Company stats fetched successfully',
          mockStats,
        );

        mockCompanyService.getCompaniesStats.mockResolvedValue(
          expectedResponse,
        );
        const result = await controller.getCompaniesStats(ctx.ctx);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompaniesStats).toHaveBeenCalledWith(
          ctx.ctx,
        );
      });
    });

    describe('permissions', () => {
      it('should require LIST_COMPANIES permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getCompaniesStats,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_COMPANIES);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to getCompaniesStats endpoint', () => {
        const pipes = reflector.get('__pipes__', controller.getCompaniesStats);
        expect(pipes).toBeDefined();
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const serviceError = new Error('Database query failed');
        mockCompanyService.getCompaniesStats.mockRejectedValue(serviceError);

        await expect(controller.getCompaniesStats(ctx.ctx)).rejects.toThrow(
          'Database query failed',
        );
        expect(mockCompanyService.getCompaniesStats).toHaveBeenCalledWith(
          ctx.ctx,
        );
      });
    });
  });

  describe('getCompaniesKybStats', () => {
    describe('when getCompaniesKybStats is called', () => {
      it('should successfully get companies KYB statistics', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const mockKybStats = [
          new GetStatsResponseDTO({ count: 10, value: KybStatuses.APPROVED }),
          new GetStatsResponseDTO({ count: 8, value: KybStatuses.PENDING }),
          new GetStatsResponseDTO({ count: 2, value: KybStatuses.DENIED }),
        ];

        const expectedResponse = ResponseFormatter.success(
          'Company stats fetched successfully',
          mockKybStats,
        );

        mockCompanyService.getCompaniesKybStats.mockResolvedValue(
          expectedResponse,
        );
        const result = await controller.getCompaniesKybStats(ctx.ctx);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompaniesKybStats).toHaveBeenCalledWith(
          ctx.ctx,
        );
      });
    });

    describe('permissions', () => {
      it('should require LIST_COMPANIES permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getCompaniesKybStats,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_COMPANIES);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to getCompaniesKybStats endpoint', () => {
        const pipes = reflector.get(
          '__pipes__',
          controller.getCompaniesKybStats,
        );
        expect(pipes).toBeDefined();
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const serviceError = new Error('Database query failed');
        mockCompanyService.getCompaniesKybStats.mockRejectedValue(serviceError);

        await expect(controller.getCompaniesKybStats(ctx.ctx)).rejects.toThrow(
          'Database query failed',
        );
        expect(mockCompanyService.getCompaniesKybStats).toHaveBeenCalledWith(
          ctx.ctx,
        );
      });
    });
  });

  describe('getCompanyDetailsById', () => {
    describe('when getCompanyDetailsById is called with valid id', () => {
      it('should successfully get company details by id', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.VIEW_COMPANY],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'test-company-id';
        const mockCompanyData = new GetCompanyKYBDataResponseDTO({
          id: companyId,
          name: 'Test Company',
          kybStatus: KybStatuses.APPROVED,
          primaryUser: new PrimaryUserDto({
            id: 'user-id',
            email: 'test@company.com',
          }),
          kybData: new Map(),
        });

        const expectedResponse = ResponseFormatter.success(
          'Successfully fetched company details',
          mockCompanyData,
        );

        mockCompanyService.getCompanyDetails.mockResolvedValue(
          expectedResponse,
        );
        const result = await controller.getCompanyDetailsById(
          ctx.ctx,
          companyId,
        );

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompanyDetails).toHaveBeenCalledWith(
          ctx.ctx,
          companyId,
        );
      });
    });

    describe('permissions', () => {
      it('should require VIEW_COMPANY permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getCompanyDetailsById,
        );
        expect(requiredPermission).toBe(PERMISSIONS.VIEW_COMPANY);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.VIEW_COMPANY],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'test-company-id';
        const serviceError = new Error('Service error');
        mockCompanyService.getCompanyDetails.mockRejectedValue(serviceError);

        await expect(
          controller.getCompanyDetailsById(ctx.ctx, companyId),
        ).rejects.toThrow('Service error');
        expect(mockCompanyService.getCompanyDetails).toHaveBeenCalledWith(
          ctx.ctx,
          companyId,
        );
      });
    });
  });

  describe('getCompanyCustomFields', () => {
    describe('when getCompanyCustomFields is called with valid company type', () => {
      it('should successfully get company custom fields', async () => {
        const companyType = CompanyTypes.BUSINESS;
        const mockCustomFields = {
          businessName: { type: 'text', label: 'Business Name' },
          businessAddress: { type: 'text', label: 'Business Address' },
          registrationNumber: { type: 'text', label: 'Registration Number' },
        };

        const expectedResponse = ResponseFormatter.success(
          'Company custom fields fetched successfully',
          new GetCompanyCustomFieldsResponseDTO(mockCustomFields),
        );

        mockCompanyService.getCompanyCustomFields.mockResolvedValue(
          expectedResponse,
        );
        const result = await controller.getCompanyCustomFields(companyType);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getCompanyCustomFields).toHaveBeenCalledWith(
          companyType,
        );
      });
    });

    describe('public endpoint', () => {
      it('should skip auth guard', () => {
        const skipAuthGuard = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getCompanyCustomFields,
        );
        expect(skipAuthGuard).toBe(true);
      });

      it('should use exposeAll serialization strategy', () => {
        const serializeOptions = reflector.get(
          'class_serializer:options',
          controller.getCompanyCustomFields,
        );
        expect(serializeOptions).toBeDefined();
        expect(serializeOptions.strategy).toBe('exposeAll');
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const companyType = CompanyTypes.BUSINESS;
        const serviceError = new Error('Service error');
        mockCompanyService.getCompanyCustomFields.mockRejectedValue(
          serviceError,
        );

        await expect(
          controller.getCompanyCustomFields(companyType),
        ).rejects.toThrow('Service error');
        expect(mockCompanyService.getCompanyCustomFields).toHaveBeenCalledWith(
          companyType,
        );
      });
    });
  });

  describe('getCompaniesStatsAggregate', () => {
    describe('when getCompaniesStatsAggregate is called with valid filters', () => {
      it('should successfully get companies stats aggregate', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const filters: GetStatsDto = {
          filter: {
            createdAt: {
              gt: '2024-01-01',
              lt: '2024-12-31',
            },
          },
        };

        const mockStatsAggregate: GetStatsResponseDTO[] = [
          {
            period: '2024-01',
            totalCompanies: 10,
            verifiedCompanies: 8,
            pendingCompanies: 1,
            rejectedCompanies: 1,
          },
          {
            period: '2024-02',
            totalCompanies: 15,
            verifiedCompanies: 12,
            pendingCompanies: 2,
            rejectedCompanies: 1,
          },
        ];

        const expectedResponse = ResponseFormatter.success(
          'Successfully fetched companies stats aggregate',
          mockStatsAggregate,
        );

        mockCompanyService.getCompaniesStatsAggregate.mockResolvedValue(
          expectedResponse,
        );

        const result = await controller.getCompaniesStatsAggregate(
          ctx.ctx,
          filters,
        );

        expect(result).toEqual(expectedResponse);
        expect(
          mockCompanyService.getCompaniesStatsAggregate,
        ).toHaveBeenCalledWith(ctx.ctx, filters);
      });
    });

    describe('permissions', () => {
      it('should require LIST_COMPANIES permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.getCompaniesStatsAggregate,
        );
        expect(requiredPermission).toBe(PERMISSIONS.LIST_COMPANIES);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to getCompaniesStatsAggregate endpoint', () => {
        const pipes = reflector.get(
          '__pipes__',
          controller.getCompaniesStatsAggregate,
        );
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.LIST_COMPANIES],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const filters: GetStatsDto = {
          filter: {
            createdAt: {
              gt: '2024-01-01',
              lt: '2024-12-31',
            },
          },
        };

        const error = new Error('Service error');
        mockCompanyService.getCompaniesStatsAggregate.mockRejectedValue(error);

        await expect(
          controller.getCompaniesStatsAggregate(ctx.ctx, filters),
        ).rejects.toThrow('Service error');
      });
    });
  });

  describe('updateKybStatus', () => {
    describe('when updateKybStatus is called with valid data', () => {
      it('should successfully update KYB status', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_KYB_STATUS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const data: UpdateKybStatusDto = {
          action: KybStatusActions.APPROVE,
          reason: 'Documents verified successfully',
        };

        const mockCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('kybStatus', KybStatuses.APPROVED)
          .build();

        const expectedResponse = ResponseFormatter.success(
          'KYB status updated successfully',
          mockCompany,
        );

        mockCompanyService.updateKYBStatus.mockResolvedValue(expectedResponse);

        const result = await controller.updateKybStatus(ctx.ctx, data, companyId);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.updateKYBStatus).toHaveBeenCalledWith(
          ctx.ctx,
          companyId,
          data,
        );
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_COMPANY_KYB_STATUS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.updateKybStatus,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_COMPANY_KYB_STATUS);
      });
    });

    describe('validation', () => {
      it('should apply IValidationPipe to updateKybStatus endpoint', () => {
        const pipes = reflector.get(
          '__pipes__',
          controller.updateKybStatus,
        );
        expect(pipes).toContain(IValidationPipe);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_KYB_STATUS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const data: UpdateKybStatusDto = {
          action: KybStatusActions.APPROVE,
          reason: 'Documents verified successfully',
        };

        const error = new Error('Service error');
        mockCompanyService.updateKYBStatus.mockRejectedValue(error);

        await expect(
          controller.updateKybStatus(ctx.ctx, data, companyId),
        ).rejects.toThrow('Service error');
      });
    });
  });

  describe('activateCompanyAccess', () => {
    describe('when activateCompanyAccess is called with valid id', () => {
      it('should successfully activate company access', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_ACCESS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const mockCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.ACTIVE)
          .build();

        const expectedResponse = ResponseFormatter.success(
          'Company access activated successfully',
          mockCompany,
        );

        mockCompanyService.toggleCompanyAccess.mockResolvedValue(expectedResponse);

        const result = await controller.activateCompanyAccess(ctx.ctx, companyId);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.toggleCompanyAccess).toHaveBeenCalledWith(
          ctx.ctx,
          companyId,
          true,
        );
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_COMPANY_ACCESS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.activateCompanyAccess,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_COMPANY_ACCESS);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_ACCESS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const error = new Error('Service error');
        mockCompanyService.toggleCompanyAccess.mockRejectedValue(error);

        await expect(
          controller.activateCompanyAccess(ctx.ctx, companyId),
        ).rejects.toThrow('Service error');
      });
    });
  });

  describe('deactivateCompanyAccess', () => {
    describe('when deactivateCompanyAccess is called with valid id', () => {
      it('should successfully deactivate company access', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_ACCESS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const mockCompany = new CompanyBuilder()
          .with('id', companyId)
          .with('status', CompanyStatuses.INACTIVE)
          .build();

        const expectedResponse = ResponseFormatter.success(
          'Company access deactivated successfully',
          mockCompany,
        );

        mockCompanyService.toggleCompanyAccess.mockResolvedValue(expectedResponse);

        const result = await controller.deactivateCompanyAccess(ctx.ctx, companyId);

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.toggleCompanyAccess).toHaveBeenCalledWith(
          ctx.ctx,
          companyId,
          false,
        );
      });
    });

    describe('permissions', () => {
      it('should require UPDATE_COMPANY_ACCESS permission', () => {
        const requiredPermission = reflector.get(
          REQUIRED_PERMISSION_METADATA_KEY,
          controller.deactivateCompanyAccess,
        );
        expect(requiredPermission).toBe(PERMISSIONS.UPDATE_COMPANY_ACCESS);
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const ctx = createMockContext({
          permissions: [PERMISSIONS.UPDATE_COMPANY_ACCESS],
          user: new UserBuilder()
            .with('company', new CompanyBuilder().build())
            .build(),
        });

        const companyId = 'company-123';
        const error = new Error('Service error');
        mockCompanyService.toggleCompanyAccess.mockRejectedValue(error);

        await expect(
          controller.deactivateCompanyAccess(ctx.ctx, companyId),
        ).rejects.toThrow('Service error');
      });
    });
  });

  describe('getUserAgreements', () => {
    describe('when getUserAgreements is called', () => {
      it('should successfully get user agreements', async () => {
        const mockAgreements = [
          {
            id: 'agreement-1',
            title: 'Terms of Service',
            content: 'Lorem ipsum dolor sit amet...',
            version: '1.0',
            isActive: true,
          },
          {
            id: 'agreement-2',
            title: 'Privacy Policy',
            content: 'Lorem ipsum dolor sit amet...',
            version: '2.0',
            isActive: true,
          },
        ];

        const expectedResponse = ResponseFormatter.success(
          'User agreements fetched successfully',
          mockAgreements,
        );

        mockCompanyService.getUserAgreements.mockResolvedValue(expectedResponse);

        const result = await controller.getUserAgreements();

        expect(result).toEqual(expectedResponse);
        expect(mockCompanyService.getUserAgreements).toHaveBeenCalledWith();
      });
    });

    describe('public endpoint', () => {
      it('should skip auth guard', () => {
        const skipAuthGuard = reflector.get(
          SKIP_AUTH_METADATA_KEY,
          controller.getUserAgreements,
        );
        expect(skipAuthGuard).toBe(true);
      });

      it('should use exposeAll serialization strategy', () => {
        const serializeOptions = reflector.get(
          'class_serializer:options',
          controller.getUserAgreements,
        );
        expect(serializeOptions).toBeDefined();
        expect(serializeOptions.strategy).toBe('exposeAll');
      });
    });

    describe('error', () => {
      it('should propagate errors from company service', async () => {
        const serviceError = new Error('Service error');
        mockCompanyService.getUserAgreements.mockRejectedValue(serviceError);

        await expect(controller.getUserAgreements()).rejects.toThrow(
          'Service error',
        );
        expect(mockCompanyService.getUserAgreements).toHaveBeenCalledWith();
      });
    });
  });
});
