import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CompanyTypes } from '@common/database/constants';
import {
  KybStatusActions,
  UpdateCompanyDetailsDto,
  UpdateKybStatusDto,
  ProfileDto,
  PrimaryUserDto,
  GetCompanyResponseDTO,
  GetCompanyKYBDataResponseDTO,
  GetCompanySubTypesResponseDTO,
  GetCompanyCustomFieldsResponseDTO,
  GetCompanyTypesResponseDTO,
  UpdateCompanyKybStatusResponseDTO,
  GetStatsResponseDTO,
  GetStatsDto,
} from './index.dto';

describe('Company DTOs', () => {
  describe('KybStatusActions enum', () => {
    it('should define correct enum values', () => {
      expect(KybStatusActions.APPROVE).toBe('approve');
      expect(KybStatusActions.DENY).toBe('deny');
    });

    it('should have only expected enum values', () => {
      const enumValues = Object.values(KybStatusActions);
      expect(enumValues).toHaveLength(2);
      expect(enumValues).toContain('approve');
      expect(enumValues).toContain('deny');
    });
  });

  describe('UpdateCompanyDetailsDto', () => {
    it('should validate valid rcNumber', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.rcNumber = '123456789012345'; // 15 alphanumeric characters

      const errors = await validate(dto);
      const rcNumberErrors = errors.find(error => error.property === 'rcNumber');
      
      expect(rcNumberErrors).toBeUndefined();
    });

    it('should reject rcNumber with incorrect length', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.rcNumber = '12345'; // too short

      const errors = await validate(dto);
      const rcNumberErrors = errors.find(error => error.property === 'rcNumber');
      
      expect(rcNumberErrors).toBeDefined();
      expect(rcNumberErrors?.constraints).toHaveProperty('isLength');
      expect(rcNumberErrors?.constraints?.isLength).toBe('rcNumber must be exactly 15 digits long.');
    });

    it('should reject rcNumber with non-alphanumeric characters', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.rcNumber = '123456789012-45'; // contains hyphen

      const errors = await validate(dto);
      const rcNumberErrors = errors.find(error => error.property === 'rcNumber');
      
      expect(rcNumberErrors).toBeDefined();
      expect(rcNumberErrors?.constraints).toHaveProperty('isAlphanumeric');
    });

    it('should validate valid accountNumber', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.accountNumber = '1234567890'; // 10 digits

      const errors = await validate(dto);
      const accountNumberErrors = errors.find(error => error.property === 'accountNumber');
      
      expect(accountNumberErrors).toBeUndefined();
    });

    it('should reject accountNumber with incorrect length', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.accountNumber = '123456'; // too short

      const errors = await validate(dto);
      const accountNumberErrors = errors.find(error => error.property === 'accountNumber');
      
      expect(accountNumberErrors).toBeDefined();
      expect(accountNumberErrors?.constraints).toHaveProperty('isLength');
    });

    it('should reject accountNumber with no digits', async () => {
      const dto = new UpdateCompanyDetailsDto();
      dto.accountNumber = 'abcdefghij'; // no digits at all

      const errors = await validate(dto);
      const accountNumberErrors = errors.find(error => error.property === 'accountNumber');
      
      expect(accountNumberErrors).toBeDefined();
      expect(accountNumberErrors?.constraints).toHaveProperty('matches');
    });

    it('should allow optional fields to be undefined', async () => {
      const dto = new UpdateCompanyDetailsDto();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateKybStatusDto', () => {
    it('should validate with required action field', async () => {
      const dto = new UpdateKybStatusDto();
      dto.action = KybStatusActions.APPROVE;

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject without action field', async () => {
      const dto = new UpdateKybStatusDto();

      const errors = await validate(dto);
      const actionErrors = errors.find(error => error.property === 'action');
      
      expect(actionErrors).toBeDefined();
      expect(actionErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject invalid action value', async () => {
      const dto = new UpdateKybStatusDto();
      dto.action = 'invalid' as KybStatusActions;

      const errors = await validate(dto);
      const actionErrors = errors.find(error => error.property === 'action');
      
      expect(actionErrors).toBeDefined();
      expect(actionErrors?.constraints).toHaveProperty('isEnum');
    });

    it('should validate with optional reason field', async () => {
      const dto = new UpdateKybStatusDto();
      dto.action = KybStatusActions.DENY;
      dto.reason = 'Incomplete documentation';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow reason to be undefined', async () => {
      const dto = new UpdateKybStatusDto();
      dto.action = KybStatusActions.APPROVE;

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('ProfileDto', () => {
    it('should create instance with constructor', () => {
      const profileData = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
      };

      const profile = new ProfileDto(profileData);

      expect(profile.firstName).toBe('John');
      expect(profile.lastName).toBe('Doe');
      expect(profile.phone).toBe('+1234567890');
    });

    it('should create instance with partial data', () => {
      const profileData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      const profile = new ProfileDto(profileData);

      expect(profile.firstName).toBe('Jane');
      expect(profile.lastName).toBe('Smith');
      expect(profile.phone).toBeUndefined();
    });

    it('should handle empty constructor parameter', () => {
      const profile = new ProfileDto({});

      expect(profile.firstName).toBeUndefined();
      expect(profile.lastName).toBeUndefined();
      expect(profile.phone).toBeUndefined();
    });
  });

  describe('PrimaryUserDto', () => {
    it('should create instance with nested profile', () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        bvn: '12345678901',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
        },
      };

      const user = new PrimaryUserDto(userData);

      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.bvn).toBe('12345678901');
      expect(user.profile).toBeDefined();
      expect(user.profile?.firstName).toBe('John');
    });

    it('should create instance without optional fields', () => {
      const userData = {
        id: 'user-456',
        email: 'test2@example.com',
      };

      const user = new PrimaryUserDto(userData);

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('test2@example.com');
      expect(user.bvn).toBeUndefined();
      expect(user.profile).toBeUndefined();
    });
  });

  describe('GetCompanyResponseDTO', () => {
    it('should create instance with all properties', () => {
      const companyData = {
        id: 'company-123',
        name: 'Test Company',
        rcNumber: '123456789012345',
        isVerified: true,
        kybStatus: 'approved',
        isActive: true,
        status: 'active',
        type: CompanyTypes.BUSINESS,
        subtype: 'LLC',
        tier: 'tier1',
        createdAt: new Date('2023-01-01'),
        primaryUser: {
          id: 'user-123',
          email: 'test@example.com',
        },
      };

      const company = new GetCompanyResponseDTO(companyData);

      expect(company.id).toBe('company-123');
      expect(company.name).toBe('Test Company');
      expect(company.rcNumber).toBe('123456789012345');
      expect(company.isVerified).toBe(true);
      expect(company.kybStatus).toBe('approved');
      expect(company.isActive).toBe(true);
      expect(company.status).toBe('active');
      expect(company.type).toBe(CompanyTypes.BUSINESS);
      expect(company.subtype).toBe('LLC');
      expect(company.tier).toBe('tier1');
      expect(company.createdAt).toEqual(new Date('2023-01-01'));
      expect(company.primaryUser).toBeDefined();
    });

    it('should handle transformation correctly', () => {
      const plainData = {
        id: 'company-456',
        name: 'Another Company',
        rcNumber: '987654321098765',
        isVerified: false,
        kybStatus: 'pending',
        isActive: true,
        status: 'active',
        type: CompanyTypes.INDIVIDUAL,
        subtype: 'sole_proprietorship',
        tier: 'tier2',
        createdAt: '2023-02-01T00:00:00.000Z',
        primaryUser: {
          id: 'user-456',
          email: 'test2@example.com',
        },
      };

      const company = plainToInstance(GetCompanyResponseDTO, plainData);

      expect(company).toBeInstanceOf(GetCompanyResponseDTO);
      expect(company.id).toBe('company-456');
      expect(company.type).toBe(CompanyTypes.INDIVIDUAL);
    });
  });

  describe('GetCompanyKYBDataResponseDTO', () => {
    it('should extend GetCompanyResponseDTO with kybData', () => {
      const kybData = new Map([
        ['document1', { type: 'certificate', status: 'verified' }],
        ['document2', { type: 'license', status: 'pending' }],
      ]);

      const companyKybData = {
        id: 'company-789',
        name: 'KYB Company',
        rcNumber: '111222333444555',
        isVerified: false,
        kybStatus: 'submitted',
        isActive: true,
        status: 'active',
        type: CompanyTypes.LICENSED_ENTITY,
        subtype: 'bank',
        tier: 'tier3',
        createdAt: new Date('2023-03-01'),
        primaryUser: {
          id: 'user-789',
          email: 'kyb@example.com',
        },
        kybData,
      };

      const company = new GetCompanyKYBDataResponseDTO(companyKybData);

      expect(company).toBeInstanceOf(GetCompanyResponseDTO);
      expect(company.id).toBe('company-789');
      expect(company.kybData).toBe(kybData);
      expect(company.kybData.get('document1')).toEqual({ type: 'certificate', status: 'verified' });
    });
  });

  describe('GetCompanySubTypesResponseDTO', () => {
    it('should create instance with company subtypes', () => {
      const subtypesData = {
        [CompanyTypes.INDIVIDUAL]: [{ value: 'sole_proprietorship', default: true }, { value: 'freelancer', default: false }],
        [CompanyTypes.LICENSED_ENTITY]: [{ value: 'bank', default: true }, { value: 'insurance', default: false }, { value: 'financial_tech', default: false }],
        [CompanyTypes.BUSINESS]: [{ value: 'llc', default: true }, { value: 'corporation', default: false }, { value: 'partnership', default: false }],
      };

      const subtypes = new GetCompanySubTypesResponseDTO(subtypesData);

      expect(subtypes[CompanyTypes.INDIVIDUAL]).toEqual([{ value: 'sole_proprietorship', default: true }, { value: 'freelancer', default: false }]);
      expect(subtypes[CompanyTypes.LICENSED_ENTITY]).toEqual([{ value: 'bank', default: true }, { value: 'insurance', default: false }, { value: 'financial_tech', default: false }]);
      expect(subtypes[CompanyTypes.BUSINESS]).toEqual([{ value: 'llc', default: true }, { value: 'corporation', default: false }, { value: 'partnership', default: false }]);
    });
  });

  describe('GetStatsDto and related DTOs', () => {
    it('should validate GetStatsDto with proper structure', async () => {
      const statsData = {
        filter: {
          createdAt: {
            gt: '2023-01-01T00:00:00.000Z',
            lt: '2023-12-31T23:59:59.999Z',
          },
        },
      };

      const dto = plainToInstance(GetStatsDto, statsData);
      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
      expect(dto.filter).toBeDefined();
      expect(dto.filter.createdAt).toBeDefined();
    });

    it('should reject invalid date strings in GetStatsDto', async () => {
      const statsData = {
        filter: {
          createdAt: {
            gt: 'invalid-date',
            lt: '2023-12-31T23:59:59.999Z',
          },
        },
      };

      const dto = plainToInstance(GetStatsDto, statsData);
      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
    });

    it('should create GetStatsResponseDTO with nested data', () => {
      const statsResponse = {
        count: 150,
        value: 'total_companies',
        data: {
          count: 50,
          value: 'verified_companies',
        },
      };

      const dto = new GetStatsResponseDTO(statsResponse);

      expect(dto.count).toBe(150);
      expect(dto.value).toBe('total_companies');
      expect(dto.data).toBeDefined();
      expect(dto.data?.count).toBe(50);
      expect(dto.data?.value).toBe('verified_companies');
    });
  });

  describe('Response DTO constructors', () => {
    it('should create GetCompanyCustomFieldsResponseDTO', () => {
      const customFields = {
        businessLicense: { type: 'file', label: 'Business License' },
        taxCertificate: { type: 'file', label: 'Tax Certificate' },
      };

      const dto = new GetCompanyCustomFieldsResponseDTO(customFields);

      expect(dto).toEqual(customFields);
    });

    it('should create GetCompanyTypesResponseDTO', () => {
      const typesData = {
        companyTypes: ['individual', 'business', 'licensed_entity'],
        companySubtypes: {
          [CompanyTypes.INDIVIDUAL]: [{ value: 'freelancer', default: true }],
          [CompanyTypes.BUSINESS]: [{ value: 'llc', default: true }],
          [CompanyTypes.LICENSED_ENTITY]: [{ value: 'bank', default: true }],
        },
      };

      const dto = new GetCompanyTypesResponseDTO(typesData);

      expect(dto.companyTypes).toEqual(['individual', 'business', 'licensed_entity']);
      expect(dto.companySubtypes).toBeDefined();
    });

    it('should create UpdateCompanyKybStatusResponseDTO', () => {
      const responseData = {
        tier: 'tier2',
      };

      const dto = new UpdateCompanyKybStatusResponseDTO(responseData);

      expect(dto.tier).toBe('tier2');
    });
  });

  describe('DTO inheritance and polymorphism', () => {
    it('should allow GetCompanyKYBDataResponseDTO to be treated as GetCompanyResponseDTO', () => {
      const kybCompany = new GetCompanyKYBDataResponseDTO({
        id: 'test-id',
        name: 'Test Company',
        rcNumber: '123456789012345',
        isVerified: true,
        kybStatus: 'approved',
        isActive: true,
        status: 'active',
        type: CompanyTypes.BUSINESS,
        subtype: 'llc',
        tier: 'tier1',
        createdAt: new Date(),
        primaryUser: {
          id: 'user-id',
          email: 'test@example.com',
        },
        kybData: new Map(),
      });

      expect(kybCompany).toBeInstanceOf(GetCompanyResponseDTO);
      expect(kybCompany).toBeInstanceOf(GetCompanyKYBDataResponseDTO);
    });
  });

  describe('Edge cases and validation scenarios', () => {
    describe('UpdateCompanyDetailsDto edge cases', () => {
      it('should handle exactly 15 character rcNumber with mixed alphanumeric', async () => {
        const dto = new UpdateCompanyDetailsDto();
        dto.rcNumber = 'ABC123DEF456789'; // exactly 15 alphanumeric

        const errors = await validate(dto);
        const rcNumberErrors = errors.find(error => error.property === 'rcNumber');
        
        expect(rcNumberErrors).toBeUndefined();
      });

      it('should reject rcNumber longer than 15 characters', async () => {
        const dto = new UpdateCompanyDetailsDto();
        dto.rcNumber = '1234567890123456'; // 16 characters

        const errors = await validate(dto);
        const rcNumberErrors = errors.find(error => error.property === 'rcNumber');
        
        expect(rcNumberErrors).toBeDefined();
        expect(rcNumberErrors?.constraints).toHaveProperty('isLength');
      });

      it('should reject accountNumber with special characters', async () => {
        const dto = new UpdateCompanyDetailsDto();
        dto.accountNumber = '123-456-789'; // contains hyphens

        const errors = await validate(dto);
        const accountNumberErrors = errors.find(error => error.property === 'accountNumber');
        
        expect(accountNumberErrors).toBeDefined();
      });

      it('should handle null values gracefully', async () => {
        const dto = new UpdateCompanyDetailsDto();
        dto.rcNumber = null as any;
        dto.accountNumber = null as any;

        const errors = await validate(dto);
        
        // Should not fail validation since fields are optional
        expect(errors).toHaveLength(0);
      });
    });

    describe('UpdateKybStatusDto edge cases', () => {
      it('should reject empty string as action', async () => {
        const dto = new UpdateKybStatusDto();
        dto.action = '' as KybStatusActions;

        const errors = await validate(dto);
        const actionErrors = errors.find(error => error.property === 'action');
        
        expect(actionErrors).toBeDefined();
        expect(actionErrors?.constraints).toHaveProperty('isNotEmpty');
      });

      it('should accept null reason field', async () => {
        const dto = new UpdateKybStatusDto();
        dto.action = KybStatusActions.APPROVE;
        dto.reason = null as any;

        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      });

      it('should reject non-string reason', async () => {
        const dto = new UpdateKybStatusDto();
        dto.action = KybStatusActions.DENY;
        dto.reason = 123 as any;

        const errors = await validate(dto);
        const reasonErrors = errors.find(error => error.property === 'reason');
        
        expect(reasonErrors).toBeDefined();
        expect(reasonErrors?.constraints).toHaveProperty('isString');
      });
    });

    describe('GetStatsDto validation edge cases', () => {
      it('should reject missing createdAt filter', async () => {
        const statsData = {
          filter: {},
        };

        const dto = plainToInstance(GetStatsDto, statsData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });

      it('should validate with only gt date', async () => {
        const statsData = {
          filter: {
            createdAt: {
              gt: '2023-01-01T00:00:00.000Z',
            },
          },
        };

        const dto = plainToInstance(GetStatsDto, statsData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should validate with only lt date', async () => {
        const statsData = {
          filter: {
            createdAt: {
              lt: '2023-12-31T23:59:59.999Z',
            },
          },
        };

        const dto = plainToInstance(GetStatsDto, statsData);
        const errors = await validate(dto);

        expect(errors).toHaveLength(0);
      });

      it('should reject invalid ISO date format', async () => {
        const statsData = {
          filter: {
            createdAt: {
              gt: 'invalid-date-string', // clearly invalid date
              lt: '2023-12-31T23:59:59.999Z',
            },
          },
        };

        const dto = plainToInstance(GetStatsDto, statsData);
        const errors = await validate(dto);

        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Transformation and serialization', () => {
    describe('Class-transformer integration', () => {
      it('should transform plain object to GetCompanyResponseDTO with proper types', () => {
        const plainData = {
          id: 'company-123',
          name: 'Test Company',
          rcNumber: '123456789012345',
          isVerified: 'true', // string instead of boolean
          kybStatus: 'approved',
          isActive: 'false', // string instead of boolean
          status: 'active',
          type: 'BUSINESS',
          subtype: 'LLC',
          tier: 'tier1',
          createdAt: '2023-01-01T00:00:00.000Z', // string instead of Date
          primaryUser: {
            id: 'user-123',
            email: 'test@example.com',
            profile: {
              firstName: 'John',
              lastName: 'Doe',
            },
          },
        };

        const transformed = plainToInstance(GetCompanyResponseDTO, plainData);

        expect(transformed).toBeInstanceOf(GetCompanyResponseDTO);
        expect(transformed.id).toBe('company-123');
        expect(transformed.name).toBe('Test Company');
        expect(transformed.primaryUser).toBeDefined();
      });

      it('should handle Map transformation in GetCompanyKYBDataResponseDTO', () => {
        const plainData = {
          id: 'company-456',
          name: 'KYB Company',
          rcNumber: '987654321098765',
          isVerified: false,
          kybStatus: 'submitted',
          isActive: true,
          status: 'active',
          type: CompanyTypes.BUSINESS,
          subtype: 'LLC',
          tier: 'tier2',
          createdAt: new Date(),
          primaryUser: {
            id: 'user-456',
            email: 'kyb@example.com',
          },
          kybData: {
            document1: { type: 'certificate', status: 'verified' },
            document2: { type: 'license', status: 'pending' },
          },
        };

        const transformed = plainToInstance(GetCompanyKYBDataResponseDTO, plainData);

        expect(transformed).toBeInstanceOf(GetCompanyKYBDataResponseDTO);
        expect(transformed.kybData).toBeDefined();
      });
    });

    describe('Nested object transformation', () => {
      it('should properly transform nested PrimaryUserDto with ProfileDto', () => {
        const plainData = {
          id: 'user-789',
          email: 'nested@example.com',
          bvn: '09876543210',
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            phone: '+9876543210',
          },
        };

        const transformed = plainToInstance(PrimaryUserDto, plainData);

        expect(transformed).toBeInstanceOf(PrimaryUserDto);
        expect(transformed.profile).toBeDefined();
        expect(transformed.profile?.firstName).toBe('Jane');
        expect(transformed.profile?.lastName).toBe('Smith');
      });

      it('should handle missing nested objects gracefully', () => {
        const plainData = {
          id: 'user-999',
          email: 'minimal@example.com',
        };

        const transformed = plainToInstance(PrimaryUserDto, plainData);

        expect(transformed).toBeInstanceOf(PrimaryUserDto);
        expect(transformed.id).toBe('user-999');
        expect(transformed.email).toBe('minimal@example.com');
        expect(transformed.bvn).toBeUndefined();
        expect(transformed.profile).toBeUndefined();
      });
    });
  });

  describe('DTO instantiation and properties', () => {
    describe('PrimaryUserDto creation', () => {
      it('should create PrimaryUserDto with profile data', () => {
        const userData = {
          id: 'user-validation',
          email: 'validation@example.com',
          profile: {
            firstName: 'Valid',
            lastName: 'User',
            phone: '+1234567890',
          },
        };

        const user = new PrimaryUserDto(userData);

        expect(user.id).toBe('user-validation');
        expect(user.email).toBe('validation@example.com');
        expect(user.profile?.firstName).toBe('Valid');
      });

      it('should create PrimaryUserDto with minimal data', () => {
        const userData = {
          id: 'user-minimal',
          email: 'minimal@example.com',
        };

        const user = new PrimaryUserDto(userData);

        expect(user.id).toBe('user-minimal');
        expect(user.email).toBe('minimal@example.com');
        expect(user.profile).toBeUndefined();
      });
    });

    describe('GetStatsResponseDTO creation', () => {
      it('should create GetStatsResponseDTO with basic data', () => {
        const statsData = {
          count: 100,
          value: 'parent_stat',
        };

        const stats = new GetStatsResponseDTO(statsData);

        expect(stats.count).toBe(100);
        expect(stats.value).toBe('parent_stat');
        expect(stats.data).toBeUndefined();
      });

      it('should handle deeply nested stats data', () => {
        const deeplyNested = {
          count: 1000,
          value: 'level_1',
          data: {
            count: 500,
            value: 'level_2',
            data: {
              count: 100,
              value: 'level_3',
            },
          },
        };

        const stats = new GetStatsResponseDTO(deeplyNested);

        expect(stats.count).toBe(1000);
        expect(stats.data?.count).toBe(500);
        expect(stats.data?.data?.count).toBe(100);
      });
    });
  });

  describe('Data integrity and consistency', () => {
    it('should maintain data integrity across multiple transformations', () => {
      const originalData = {
        id: 'integrity-test',
        name: 'Integrity Company',
        rcNumber: '555666777888999',
        isVerified: true,
        kybStatus: 'approved',
        isActive: true,
        status: 'active',
        type: CompanyTypes.LICENSED_ENTITY,
        subtype: 'financial_tech',
        tier: 'tier1',
        createdAt: new Date('2023-06-15T10:30:00.000Z'),
        primaryUser: {
          id: 'integrity-user',
          email: 'integrity@example.com',
          bvn: '11111111111',
          profile: {
            firstName: 'Integrity',
            lastName: 'Test',
            phone: '+1111111111',
          },
        },
      };

      // Transform to DTO and back
      const dto = new GetCompanyResponseDTO(originalData);
      const transformed = plainToInstance(GetCompanyResponseDTO, dto);

      expect(transformed.id).toBe(originalData.id);
      expect(transformed.name).toBe(originalData.name);
      expect(transformed.rcNumber).toBe(originalData.rcNumber);
      expect(transformed.type).toBe(originalData.type);
      expect(transformed.primaryUser.email).toBe(originalData.primaryUser.email);
    });

    it('should handle enum values consistently', () => {
      const businessCompany = new GetCompanyResponseDTO({
        id: 'enum-test',
        name: 'Enum Test',
        rcNumber: '123123123123123',
        isVerified: false,
        kybStatus: 'pending',
        isActive: true,
        status: 'active',
        type: CompanyTypes.BUSINESS,
        subtype: 'corporation',
        tier: 'tier2',
        createdAt: new Date(),
        primaryUser: {
          id: 'enum-user',
          email: 'enum@example.com',
        },
      });

      expect(businessCompany.type).toBe(CompanyTypes.BUSINESS);
      expect(Object.values(CompanyTypes)).toContain(businessCompany.type);
    });
  });
});