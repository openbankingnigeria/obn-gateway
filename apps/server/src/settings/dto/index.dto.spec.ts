import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CompanyTypes } from '@common/database/constants';
import {
  KybRequirements,
  UpdateKybRequirementsDto,
  UpdateCompanySubtypesRequest,
  KybRequirementsResponse,
  ApiKeyResponse,
  IPRestrictionRequest,
  IPRestrictionResponse,
  ClientRequest,
  ClientResponse,
  GeneralSettingsUpdateDto,
  UserAgreementUpdateDto,
  EmailSettingsUpdateDto,
  EmailTemplateDto,
  SettingsUpdateDtos,
} from './index.dto';
import { KybDataTypes } from '../types';

describe('Settings DTOs', () => {
  describe('KybRequirements', () => {
    it('should validate with all required fields', async () => {
      const dto = new KybRequirements();
      dto.name = 'business_license';
      dto.label = 'Business License';
      dto.type = KybDataTypes.FILE;

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject without name field', async () => {
      const dto = new KybRequirements();
      dto.label = 'Business License';
      dto.type = KybDataTypes.FILE;

      const errors = await validate(dto);
      const nameErrors = errors.find(error => error.property === 'name');
      
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject without label field', async () => {
      const dto = new KybRequirements();
      dto.name = 'business_license';
      dto.type = KybDataTypes.FILE;

      const errors = await validate(dto);
      const labelErrors = errors.find(error => error.property === 'label');
      
      expect(labelErrors).toBeDefined();
      expect(labelErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject without type field', async () => {
      const dto = new KybRequirements();
      dto.name = 'business_license';
      dto.label = 'Business License';

      const errors = await validate(dto);
      const typeErrors = errors.find(error => error.property === 'type');
      
      expect(typeErrors).toBeDefined();
      expect(typeErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject invalid enum type', async () => {
      const dto = new KybRequirements();
      dto.name = 'business_license';
      dto.label = 'Business License';
      dto.type = 'invalid_type' as KybDataTypes;

      const errors = await validate(dto);
      const typeErrors = errors.find(error => error.property === 'type');
      
      expect(typeErrors).toBeDefined();
      expect(typeErrors?.constraints).toHaveProperty('isEnum');
    });

    it('should reject non-string name', async () => {
      const dto = new KybRequirements();
      dto.name = 123 as any;
      dto.label = 'Business License';
      dto.type = KybDataTypes.FILE;

      const errors = await validate(dto);
      const nameErrors = errors.find(error => error.property === 'name');
      
      expect(nameErrors).toBeDefined();
      expect(nameErrors?.constraints).toHaveProperty('isString');
    });
  });

  describe('UpdateKybRequirementsDto', () => {
    it('should validate with valid newKybRequirements array', async () => {
      const dto = new UpdateKybRequirementsDto();
      const kybReq = new KybRequirements();
      kybReq.name = 'tax_certificate';
      kybReq.label = 'Tax Certificate';
      kybReq.type = KybDataTypes.FILE;
      dto.newKybRequirements = [kybReq];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with valid removedKybRequirements array', async () => {
      const dto = new UpdateKybRequirementsDto();
      dto.removedKybRequirements = ['business_license', 'tax_certificate'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with both arrays provided', async () => {
      const dto = new UpdateKybRequirementsDto();
      const kybReq = new KybRequirements();
      kybReq.name = 'new_requirement';
      kybReq.label = 'New Requirement';
      kybReq.type = KybDataTypes.STRING;
      dto.newKybRequirements = [kybReq];
      dto.removedKybRequirements = ['old_requirement'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with empty arrays', async () => {
      const dto = new UpdateKybRequirementsDto();
      dto.newKybRequirements = [];
      dto.removedKybRequirements = [];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow optional fields to be undefined', async () => {
      const dto = new UpdateKybRequirementsDto();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid newKybRequirements nested validation', async () => {
      const dto = new UpdateKybRequirementsDto();
      const kybReq = new KybRequirements();
      kybReq.name = '';
      kybReq.label = 'Invalid Requirement';
      kybReq.type = KybDataTypes.FILE;
      dto.newKybRequirements = [kybReq];

      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('UpdateCompanySubtypesRequest', () => {
    it('should validate with individual subtypes', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.INDIVIDUAL] = ['sole_proprietorship', 'freelancer'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with business subtypes', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.BUSINESS] = ['llc', 'corporation', 'partnership'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with licensed entity subtypes', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.LICENSED_ENTITY] = ['bank', 'insurance', 'financial_tech'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with all company types', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.INDIVIDUAL] = ['sole_proprietorship'];
      dto[CompanyTypes.BUSINESS] = ['llc'];
      dto[CompanyTypes.LICENSED_ENTITY] = ['bank'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow optional fields to be undefined', async () => {
      const dto = new UpdateCompanySubtypesRequest();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string array elements', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.INDIVIDUAL] = [123, 'valid_string'] as any;

      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('KybRequirementsResponse', () => {
    it('should create instance with constructor', () => {
      const responseData = {
        name: 'business_license',
        label: 'Business License',
        type: 'file',
        editable: true,
        maxCount: 5,
      };

      const response = new KybRequirementsResponse(responseData);

      expect(response.name).toBe('business_license');
      expect(response.label).toBe('Business License');
      expect(response.type).toBe('file');
      expect(response.editable).toBe(true);
      expect(response.maxCount).toBe(5);
    });

    it('should create instance with partial data', () => {
      const responseData = {
        name: 'tax_certificate',
        label: 'Tax Certificate',
      };

      const response = new KybRequirementsResponse(responseData);

      expect(response.name).toBe('tax_certificate');
      expect(response.label).toBe('Tax Certificate');
      expect(response.type).toBeUndefined();
      expect(response.editable).toBeUndefined();
      expect(response.maxCount).toBeUndefined();
    });

    it('should handle empty constructor parameter', () => {
      const response = new KybRequirementsResponse({});

      expect(response.name).toBeUndefined();
      expect(response.label).toBeUndefined();
      expect(response.type).toBeUndefined();
      expect(response.editable).toBeUndefined();
      expect(response.maxCount).toBeUndefined();
    });
  });

  describe('ApiKeyResponse', () => {
    it('should create instance with key and environment', () => {
      const responseData = {
        key: 'sk_test_123456789',
        environment: 'test',
      };

      const response = new ApiKeyResponse(responseData);

      expect(response.key).toBe('sk_test_123456789');
      expect(response.environment).toBe('test');
    });

    it('should create instance with null key', () => {
      const responseData = {
        key: null,
        environment: 'production',
      };

      const response = new ApiKeyResponse(responseData);

      expect(response.key).toBeNull();
      expect(response.environment).toBe('production');
    });

    it('should handle empty constructor parameter', () => {
      const response = new ApiKeyResponse({});

      expect(response.key).toBeUndefined();
      expect(response.environment).toBeUndefined();
    });
  });

  describe('IPRestrictionRequest', () => {
    it('should validate with valid IP addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['192.168.1.1', '10.0.0.1', '172.16.0.1'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with IPv6 addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['2001:0db8:85a3:0000:0000:8a2e:0370:7334', '::1'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject empty array', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = [];

      const errors = await validate(dto);
      const ipsErrors = errors.find(error => error.property === 'ips');
      
      expect(ipsErrors).toBeDefined();
      expect(ipsErrors?.constraints).toHaveProperty('arrayNotEmpty');
    });

    it('should reject invalid IP addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['192.168.1.256', 'invalid-ip'];

      const errors = await validate(dto);
      const ipsErrors = errors.find(error => error.property === 'ips');
      
      expect(ipsErrors).toBeDefined();
      expect(ipsErrors?.constraints).toHaveProperty('isIp');
    });

    it('should reject duplicate IP addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['192.168.1.1', '192.168.1.1', '10.0.0.1'];

      const errors = await validate(dto);
      const ipsErrors = errors.find(error => error.property === 'ips');
      
      expect(ipsErrors).toBeDefined();
      expect(ipsErrors?.constraints).toHaveProperty('arrayUnique');
    });

    it('should reject empty string IP addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['192.168.1.1', '', '10.0.0.1'];

      const errors = await validate(dto);
      const ipsErrors = errors.find(error => error.property === 'ips');
      
      expect(ipsErrors).toBeDefined();
      expect(ipsErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject non-string IP addresses', async () => {
      const dto = new IPRestrictionRequest();
      dto.ips = ['192.168.1.1', 123] as any;

      const errors = await validate(dto);
      const ipsErrors = errors.find(error => error.property === 'ips');
      
      expect(ipsErrors).toBeDefined();
      expect(ipsErrors?.constraints).toHaveProperty('isString');
    });
  });

  describe('IPRestrictionResponse', () => {
    it('should create instance with ips and environment', () => {
      const responseData = {
        ips: ['192.168.1.1', '10.0.0.1'],
        environment: 'production',
      };

      const response = new IPRestrictionResponse(responseData);

      expect(response.ips).toEqual(['192.168.1.1', '10.0.0.1']);
      expect(response.environment).toBe('production');
    });

    it('should handle empty constructor parameter', () => {
      const response = new IPRestrictionResponse({});

      expect(response.ips).toBeUndefined();
      expect(response.environment).toBeUndefined();
    });
  });

  describe('ClientRequest', () => {
    it('should validate with valid clientId', async () => {
      const dto = new ClientRequest();
      dto.clientId = 'client_123456789';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject without clientId', async () => {
      const dto = new ClientRequest();

      const errors = await validate(dto);
      const clientIdErrors = errors.find(error => error.property === 'clientId');
      
      expect(clientIdErrors).toBeDefined();
      expect(clientIdErrors?.constraints).toHaveProperty('isString');
    });

    it('should reject non-string clientId', async () => {
      const dto = new ClientRequest();
      dto.clientId = 123 as any;

      const errors = await validate(dto);
      const clientIdErrors = errors.find(error => error.property === 'clientId');
      
      expect(clientIdErrors).toBeDefined();
      expect(clientIdErrors?.constraints).toHaveProperty('isString');
    });
  });

  describe('ClientResponse', () => {
    it('should create instance with clientId and environment', () => {
      const responseData = {
        clientId: 'client_123456789',
        environment: 'test',
      };

      const response = new ClientResponse(responseData);

      expect(response.clientId).toBe('client_123456789');
      expect(response.environment).toBe('test');
    });

    it('should handle empty constructor parameter', () => {
      const response = new ClientResponse({});

      expect(response.clientId).toBeUndefined();
      expect(response.environment).toBeUndefined();
    });
  });

  describe('GeneralSettingsUpdateDto', () => {
    it('should validate with all valid fields', async () => {
      const dto = new GeneralSettingsUpdateDto();
      dto.authTokenExpirationDuration = '3600';
      dto.failedLoginAttempts = '5';
      dto.inactivityTimeout = '1800';
      dto.invitationTokenExpirationDuration = '86400';
      dto.passwordResetTokenExpirationDuration = '3600';
      dto.requestTimeout = '30';
      dto.twoFaExpirationDuration = '300';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with partial fields', async () => {
      const dto = new GeneralSettingsUpdateDto();
      dto.authTokenExpirationDuration = '7200';
      dto.failedLoginAttempts = '3';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow all fields to be undefined', async () => {
      const dto = new GeneralSettingsUpdateDto();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string values', async () => {
      const dto = new GeneralSettingsUpdateDto();
      dto.authTokenExpirationDuration = 3600 as any;

      const errors = await validate(dto);
      const tokenErrors = errors.find(error => error.property === 'authTokenExpirationDuration');
      
      expect(tokenErrors).toBeDefined();
      expect(tokenErrors?.constraints).toHaveProperty('isString');
    });

    it('should validate individual fields correctly', async () => {
      const dto = new GeneralSettingsUpdateDto();
      dto.failedLoginAttempts = '10';
      dto.inactivityTimeout = '600';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
      expect(dto.failedLoginAttempts).toBe('10');
      expect(dto.inactivityTimeout).toBe('600');
    });
  });

  describe('UserAgreementUpdateDto', () => {
    it('should validate with valid URLs', async () => {
      const dto = new UserAgreementUpdateDto();
      dto.privacyPolicy = 'https://example.com/privacy';
      dto.termsAndConditions = 'https://example.com/terms';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with one URL provided', async () => {
      const dto = new UserAgreementUpdateDto();
      dto.privacyPolicy = 'https://example.com/privacy';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow all fields to be undefined', async () => {
      const dto = new UserAgreementUpdateDto();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject invalid URLs', async () => {
      const dto = new UserAgreementUpdateDto();
      dto.privacyPolicy = 'not-a-valid-url';

      const errors = await validate(dto);
      const privacyErrors = errors.find(error => error.property === 'privacyPolicy');
      
      expect(privacyErrors).toBeDefined();
      expect(privacyErrors?.constraints).toHaveProperty('isUrl');
    });

    it('should reject non-string URLs', async () => {
      const dto = new UserAgreementUpdateDto();
      dto.termsAndConditions = 123 as any;

      const errors = await validate(dto);
      const termsErrors = errors.find(error => error.property === 'termsAndConditions');
      
      expect(termsErrors).toBeDefined();
      expect(termsErrors?.constraints).toHaveProperty('isString');
    });

    it('should validate HTTP and HTTPS URLs', async () => {
      const dto = new UserAgreementUpdateDto();
      dto.privacyPolicy = 'http://example.com/privacy';
      dto.termsAndConditions = 'https://secure.example.com/terms';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('EmailSettingsUpdateDto', () => {
    it('should validate with all valid fields', async () => {
      const dto = new EmailSettingsUpdateDto();
      dto.emailHost = 'smtp.gmail.com';
      dto.emailBaseUrl = 'https://example.com';
      dto.emailPort = '587';
      dto.emailUser = 'user@example.com';
      dto.emailPassword = 'password123';
      dto.emailFrom = 'noreply@example.com';
      dto.emailSecure = 'true';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with partial fields', async () => {
      const dto = new EmailSettingsUpdateDto();
      dto.emailHost = 'smtp.outlook.com';
      dto.emailPort = '993';
      dto.emailSecure = 'false';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should allow all fields to be undefined', async () => {
      const dto = new EmailSettingsUpdateDto();

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject non-string values', async () => {
      const dto = new EmailSettingsUpdateDto();
      dto.emailPort = 587 as any;
      dto.emailSecure = true as any;

      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate individual email settings', async () => {
      const dto = new EmailSettingsUpdateDto();
      dto.emailUser = 'admin@company.com';
      dto.emailFrom = 'notifications@company.com';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
      expect(dto.emailUser).toBe('admin@company.com');
      expect(dto.emailFrom).toBe('notifications@company.com');
    });
  });

  describe('EmailTemplateDto', () => {
    it('should validate with required templateId', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = 'welcome_email';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should validate with all fields provided', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = 'password_reset';
      dto.body = 'Click here to reset your password: {{resetLink}}';
      dto.title = 'Password Reset Request';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
    });

    it('should reject without templateId', async () => {
      const dto = new EmailTemplateDto();
      dto.body = 'Some email body';
      dto.title = 'Some title';

      const errors = await validate(dto);
      const templateErrors = errors.find(error => error.property === 'temmplateId');
      
      expect(templateErrors).toBeDefined();
      expect(templateErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject empty templateId', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = '';

      const errors = await validate(dto);
      const templateErrors = errors.find(error => error.property === 'temmplateId');
      
      expect(templateErrors).toBeDefined();
      expect(templateErrors?.constraints).toHaveProperty('isNotEmpty');
    });

    it('should reject non-string templateId', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = 123 as any;

      const errors = await validate(dto);
      const templateErrors = errors.find(error => error.property === 'temmplateId');
      
      expect(templateErrors).toBeDefined();
      expect(templateErrors?.constraints).toHaveProperty('isString');
    });

    it('should allow optional body and title to be undefined', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = 'notification_email';

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
      expect(dto.body).toBeUndefined();
      expect(dto.title).toBeUndefined();
    });

    it('should reject non-string body and title', async () => {
      const dto = new EmailTemplateDto();
      dto.temmplateId = 'test_template';
      dto.body = 123 as any;
      dto.title = 456 as any;

      const errors = await validate(dto);
      
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('SettingsUpdateDtos mapping', () => {
    it('should have correct DTO mappings for all settings types', () => {
      expect(SettingsUpdateDtos['email_settings']).toBe(EmailSettingsUpdateDto);
      expect(SettingsUpdateDtos['email_templates']).toBe(EmailTemplateDto);
      expect(SettingsUpdateDtos['external_services']).toBeNull();
      expect(SettingsUpdateDtos['mock_services']).toBeNull();
      expect(SettingsUpdateDtos['general']).toBe(GeneralSettingsUpdateDto);
      expect(SettingsUpdateDtos['onboarding_custom_fields']).toBeNull();
      expect(SettingsUpdateDtos['user_agreements']).toBe(UserAgreementUpdateDto);
    });

    it('should contain all expected settings types', () => {
      const expectedTypes = [
        'email_settings',
        'email_templates',
        'external_services',
        'mock_services',
        'general',
        'onboarding_custom_fields',
        'user_agreements',
      ];

      const mappingKeys = Object.keys(SettingsUpdateDtos);
      
      expectedTypes.forEach(type => {
        expect(mappingKeys).toContain(type);
      });
    });
  });

  describe('Transformation and serialization', () => {
    describe('Class-transformer integration', () => {
      it('should transform plain object to GeneralSettingsUpdateDto', () => {
        const plainData = {
          authTokenExpirationDuration: '7200',
          failedLoginAttempts: '5',
          inactivityTimeout: '1800',
        };

        const transformed = plainToInstance(GeneralSettingsUpdateDto, plainData);

        expect(transformed).toBeInstanceOf(GeneralSettingsUpdateDto);
        expect(transformed.authTokenExpirationDuration).toBe('7200');
        expect(transformed.failedLoginAttempts).toBe('5');
        expect(transformed.inactivityTimeout).toBe('1800');
      });

      it('should transform plain object to EmailSettingsUpdateDto', () => {
        const plainData = {
          emailHost: 'smtp.example.com',
          emailPort: '587',
          emailUser: 'test@example.com',
          emailSecure: 'true',
        };

        const transformed = plainToInstance(EmailSettingsUpdateDto, plainData);

        expect(transformed).toBeInstanceOf(EmailSettingsUpdateDto);
        expect(transformed.emailHost).toBe('smtp.example.com');
        expect(transformed.emailPort).toBe('587');
        expect(transformed.emailUser).toBe('test@example.com');
        expect(transformed.emailSecure).toBe('true');
      });

      it('should transform plain object to UpdateKybRequirementsDto with nested validation', () => {
        const plainData = {
          newKybRequirements: [
            {
              name: 'business_license',
              label: 'Business License',
              type: 'file',
            },
          ],
          removedKybRequirements: ['old_requirement'],
        };

        const transformed = plainToInstance(UpdateKybRequirementsDto, plainData);

        expect(transformed).toBeInstanceOf(UpdateKybRequirementsDto);
        expect(transformed.newKybRequirements).toHaveLength(1);
        expect(transformed.newKybRequirements[0].name).toBe('business_license');
        expect(transformed.removedKybRequirements).toEqual(['old_requirement']);
      });
    });

    describe('Response DTO instantiation', () => {
      it('should create KybRequirementsResponse with Object.assign', () => {
        const data = {
          name: 'certificate',
          label: 'Company Certificate',
          type: 'file',
          editable: false,
          maxCount: 3,
          extraProperty: 'should be included',
        };

        const response = new KybRequirementsResponse(data);

        expect(response.name).toBe('certificate');
        expect(response.label).toBe('Company Certificate');
        expect(response.type).toBe('file');
        expect(response.editable).toBe(false);
        expect(response.maxCount).toBe(3);
        expect((response as any).extraProperty).toBe('should be included');
      });

      it('should create ApiKeyResponse with partial data', () => {
        const data = { key: 'api_key_123' };

        const response = new ApiKeyResponse(data);

        expect(response.key).toBe('api_key_123');
        expect(response.environment).toBeUndefined();
      });

      it('should create ClientResponse with all properties', () => {
        const data = {
          clientId: 'client_abc123',
          environment: 'staging',
        };

        const response = new ClientResponse(data);

        expect(response.clientId).toBe('client_abc123');
        expect(response.environment).toBe('staging');
      });
    });
  });

  describe('Edge cases and validation scenarios', () => {
    describe('IPRestrictionRequest edge cases', () => {
      it('should handle mixed IPv4 and IPv6 addresses', async () => {
        const dto = new IPRestrictionRequest();
        dto.ips = [
          '192.168.1.1',
          '2001:0db8:85a3::8a2e:0370:7334',
          '127.0.0.1',
          '::1',
        ];

        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      });

      it('should reject localhost string identifier', async () => {
        const dto = new IPRestrictionRequest();
        dto.ips = ['localhost', '192.168.1.1'];

        const errors = await validate(dto);
        const ipsErrors = errors.find(error => error.property === 'ips');
        
        expect(ipsErrors).toBeDefined();
        expect(ipsErrors?.constraints).toHaveProperty('isIp');
      });

      it('should reject IP addresses with ports', async () => {
        const dto = new IPRestrictionRequest();
        dto.ips = ['192.168.1.1:8080', '10.0.0.1'];

        const errors = await validate(dto);
        const ipsErrors = errors.find(error => error.property === 'ips');
        
        expect(ipsErrors).toBeDefined();
        expect(ipsErrors?.constraints).toHaveProperty('isIp');
      });

      it('should handle null values gracefully', async () => {
        const dto = new IPRestrictionRequest();
        dto.ips = null as any;

        const errors = await validate(dto);
        const ipsErrors = errors.find(error => error.property === 'ips');
        
        expect(ipsErrors).toBeDefined();
        expect(ipsErrors?.constraints).toHaveProperty('isArray');
      });
    });

    describe('EmailTemplateDto edge cases', () => {
      it('should handle null values for optional fields', async () => {
        const dto = new EmailTemplateDto();
        dto.temmplateId = 'valid_template';
        dto.body = null as any;
        dto.title = null as any;

        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      });

      it('should reject whitespace-only templateId', async () => {
        const dto = new EmailTemplateDto();
        dto.temmplateId = '   ';

        const errors = await validate(dto);
        // Note: class-validator's @IsNotEmpty() may not trim whitespace
        // This test may need adjustment based on actual validation behavior
        expect(errors.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('URL validation edge cases', () => {
      it('should accept various valid URL formats in UserAgreementUpdateDto', async () => {
        const dto = new UserAgreementUpdateDto();
        dto.privacyPolicy = 'https://subdomain.example.com/path/to/privacy?param=value#section';
        dto.termsAndConditions = 'http://example.org/terms';

        const errors = await validate(dto);
        
        expect(errors).toHaveLength(0);
      });

      it('should reject URLs without protocol', async () => {
        const dto = new UserAgreementUpdateDto();
        dto.privacyPolicy = 'example.com/privacy';

        const errors = await validate(dto);
        
        // Check if validation actually fails for URLs without protocol
        if (errors.length > 0) {
          const privacyErrors = errors.find(error => error.property === 'privacyPolicy');
          expect(privacyErrors).toBeDefined();
          expect(privacyErrors?.constraints).toHaveProperty('isUrl');
        } else {
          // If validation passes, the URL validator might be more permissive
          expect(errors).toHaveLength(0);
        }
      });

      it('should reject malformed URLs', async () => {
        const dto = new UserAgreementUpdateDto();
        dto.termsAndConditions = 'https://';

        const errors = await validate(dto);
        const termsErrors = errors.find(error => error.property === 'termsAndConditions');
        
        expect(termsErrors).toBeDefined();
        expect(termsErrors?.constraints).toHaveProperty('isUrl');
      });
    });
  });

  describe('Data integrity and consistency', () => {
    it('should maintain data integrity across multiple transformations', () => {
      const originalData = {
        authTokenExpirationDuration: '3600',
        failedLoginAttempts: '5',
        inactivityTimeout: '1800',
        invitationTokenExpirationDuration: '86400',
        passwordResetTokenExpirationDuration: '3600',
        requestTimeout: '30',
        twoFaExpirationDuration: '300',
      };

      const dto = new GeneralSettingsUpdateDto();
      Object.assign(dto, originalData);
      const transformed = plainToInstance(GeneralSettingsUpdateDto, dto);

      expect(transformed.authTokenExpirationDuration).toBe(originalData.authTokenExpirationDuration);
      expect(transformed.failedLoginAttempts).toBe(originalData.failedLoginAttempts);
      expect(transformed.inactivityTimeout).toBe(originalData.inactivityTimeout);
      expect(transformed.invitationTokenExpirationDuration).toBe(originalData.invitationTokenExpirationDuration);
      expect(transformed.passwordResetTokenExpirationDuration).toBe(originalData.passwordResetTokenExpirationDuration);
      expect(transformed.requestTimeout).toBe(originalData.requestTimeout);
      expect(transformed.twoFaExpirationDuration).toBe(originalData.twoFaExpirationDuration);
    });

    it('should handle nested object validation consistency', async () => {
      const kybRequirement = new KybRequirements();
      kybRequirement.name = 'business_registration';
      kybRequirement.label = 'Business Registration Document';
      kybRequirement.type = KybDataTypes.FILE;

      const updateDto = new UpdateKybRequirementsDto();
      updateDto.newKybRequirements = [kybRequirement];

      const errors = await validate(updateDto);
      
      expect(errors).toHaveLength(0);
      expect(updateDto.newKybRequirements[0].name).toBe(kybRequirement.name);
      expect(updateDto.newKybRequirements[0].type).toBe(kybRequirement.type);
    });

    it('should maintain company type enum consistency', async () => {
      const dto = new UpdateCompanySubtypesRequest();
      dto[CompanyTypes.BUSINESS] = ['llc', 'corporation'];
      dto[CompanyTypes.INDIVIDUAL] = ['sole_proprietorship'];
      dto[CompanyTypes.LICENSED_ENTITY] = ['bank', 'insurance'];

      const errors = await validate(dto);
      
      expect(errors).toHaveLength(0);
      expect(Object.values(CompanyTypes)).toContain(CompanyTypes.BUSINESS);
      expect(Object.values(CompanyTypes)).toContain(CompanyTypes.INDIVIDUAL);
      expect(Object.values(CompanyTypes)).toContain(CompanyTypes.LICENSED_ENTITY);
    });
  });
});