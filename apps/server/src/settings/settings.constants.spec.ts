import { BUSINESS_SETTINGS_NAME, defaultBusinessSettings } from './settings.constants';
import { CompanyTypes } from '../common/database/constants';

describe('Settings Constants', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('BUSINESS_SETTINGS_NAME', () => {
    it('should have correct business settings name', () => {
      expect(BUSINESS_SETTINGS_NAME).toBe('business_settings');
    });

    it('should be a non-empty string', () => {
      expect(typeof BUSINESS_SETTINGS_NAME).toBe('string');
      expect(BUSINESS_SETTINGS_NAME.length).toBeGreaterThan(0);
    });

    it('should use underscore naming convention', () => {
      expect(BUSINESS_SETTINGS_NAME).toMatch(/^[a-z_]+$/);
    });
  });

  describe('defaultBusinessSettings structure', () => {
    it('should have all required top-level properties', () => {
      expect(defaultBusinessSettings).toHaveProperty('uneditableFields');
      expect(defaultBusinessSettings).toHaveProperty('kybRequirements');
      expect(defaultBusinessSettings).toHaveProperty('companySubtypes');
    });

    it('should have correct property types', () => {
      expect(Array.isArray(defaultBusinessSettings.uneditableFields)).toBe(true);
      expect(Array.isArray(defaultBusinessSettings.kybRequirements)).toBe(true);
      expect(typeof defaultBusinessSettings.companySubtypes).toBe('object');
      expect(defaultBusinessSettings.companySubtypes).not.toBeNull();
    });

    it('should be immutable reference', () => {
      const originalSettings = defaultBusinessSettings;
      expect(defaultBusinessSettings).toBe(originalSettings);
    });
  });

  describe('uneditableFields', () => {
    it('should contain expected uneditable field names', () => {
      expect(defaultBusinessSettings.uneditableFields).toContain('taxIdentificationNumber');
      expect(defaultBusinessSettings.uneditableFields).toContain('registryLicense');
    });

    it('should have correct number of uneditable fields', () => {
      expect(defaultBusinessSettings.uneditableFields).toHaveLength(2);
    });

    it('should contain only string values', () => {
      defaultBusinessSettings.uneditableFields.forEach(field => {
        expect(typeof field).toBe('string');
        expect(field.length).toBeGreaterThan(0);
      });
    });

    it('should not contain duplicate field names', () => {
      const uniqueFields = [...new Set(defaultBusinessSettings.uneditableFields)];
      expect(uniqueFields).toHaveLength(defaultBusinessSettings.uneditableFields.length);
    });
  });

  describe('kybRequirements', () => {
    it('should have correct number of KYB requirements', () => {
      expect(defaultBusinessSettings.kybRequirements).toHaveLength(4);
    });

    it('should contain all required KYB requirement fields', () => {
      const expectedFields = [
        'taxIdentificationNumber',
        'registryLicense', 
        'companyStatusReport',
        'certificateOfIncorporation'
      ];

      expectedFields.forEach(fieldName => {
        const requirement = defaultBusinessSettings.kybRequirements.find(req => req.name === fieldName);
        expect(requirement).toBeDefined();
      });
    });

    describe('taxIdentificationNumber requirement', () => {
      let taxIdRequirement: any;

      beforeEach(() => {
        taxIdRequirement = defaultBusinessSettings.kybRequirements.find(req => req.name === 'taxIdentificationNumber');
      });

      it('should have correct properties', () => {
        expect(taxIdRequirement.name).toBe('taxIdentificationNumber');
        expect(taxIdRequirement.label).toBe('Tax Identification Number');
        expect(taxIdRequirement.type).toBe('string');
        expect(taxIdRequirement.editable).toBe(false);
        expect(taxIdRequirement.length).toBe(15);
      });

      it('should be marked as non-editable', () => {
        expect(taxIdRequirement.editable).toBe(false);
      });

      it('should have string type with length constraint', () => {
        expect(taxIdRequirement.type).toBe('string');
        expect(taxIdRequirement.length).toBe(15);
      });
    });

    describe('registryLicense requirement', () => {
      let registryRequirement: any;

      beforeEach(() => {
        registryRequirement = defaultBusinessSettings.kybRequirements.find(req => req.name === 'registryLicense');
      });

      it('should have correct properties', () => {
        expect(registryRequirement.name).toBe('registryLicense');
        expect(registryRequirement.label).toBe('Registry License');
        expect(registryRequirement.type).toBe('file');
        expect(registryRequirement.editable).toBe(false);
        expect(registryRequirement.maxCount).toBe(1);
      });

      it('should be file type with max count', () => {
        expect(registryRequirement.type).toBe('file');
        expect(registryRequirement.maxCount).toBe(1);
      });
    });

    describe('companyStatusReport requirement', () => {
      let statusReportRequirement: any;

      beforeEach(() => {
        statusReportRequirement = defaultBusinessSettings.kybRequirements.find(req => req.name === 'companyStatusReport');
      });

      it('should have correct properties', () => {
        expect(statusReportRequirement.name).toBe('companyStatusReport');
        expect(statusReportRequirement.label).toBe('Company Status Report');
        expect(statusReportRequirement.type).toBe('file');
        expect(statusReportRequirement.editable).toBe(true);
        expect(statusReportRequirement.maxCount).toBe(1);
      });

      it('should be editable file type', () => {
        expect(statusReportRequirement.editable).toBe(true);
        expect(statusReportRequirement.type).toBe('file');
      });
    });

    describe('certificateOfIncorporation requirement', () => {
      let incorporationRequirement: any;

      beforeEach(() => {
        incorporationRequirement = defaultBusinessSettings.kybRequirements.find(req => req.name === 'certificateOfIncorporation');
      });

      it('should have correct properties', () => {
        expect(incorporationRequirement.name).toBe('certificateOfIncorporation');
        expect(incorporationRequirement.label).toBe('Certificate Of Incorporation');
        expect(incorporationRequirement.type).toBe('file');
        expect(incorporationRequirement.editable).toBe(true);
        expect(incorporationRequirement.maxCount).toBe(1);
      });

      it('should be editable file type', () => {
        expect(incorporationRequirement.editable).toBe(true);
        expect(incorporationRequirement.type).toBe('file');
      });
    });

    it('should have consistent structure across all requirements', () => {
      defaultBusinessSettings.kybRequirements.forEach(requirement => {
        expect(requirement).toHaveProperty('name');
        expect(requirement).toHaveProperty('label');
        expect(requirement).toHaveProperty('type');
        expect(requirement).toHaveProperty('editable');
        
        expect(typeof requirement.name).toBe('string');
        expect(typeof requirement.label).toBe('string');
        expect(typeof requirement.type).toBe('string');
        expect(typeof requirement.editable).toBe('boolean');
      });
    });

    it('should have correct editable flags', () => {
      const editableRequirements = defaultBusinessSettings.kybRequirements.filter(req => req.editable);
      const nonEditableRequirements = defaultBusinessSettings.kybRequirements.filter(req => !req.editable);
      
      expect(editableRequirements).toHaveLength(2);
      expect(nonEditableRequirements).toHaveLength(2);
      
      expect(nonEditableRequirements.map(req => req.name)).toEqual(
        expect.arrayContaining(['taxIdentificationNumber', 'registryLicense'])
      );
    });
  });

  describe('companySubtypes', () => {
    it('should have subtypes for defined CompanyTypes in settings', () => {
      const definedCompanyTypes = [CompanyTypes.INDIVIDUAL, CompanyTypes.LICENSED_ENTITY, CompanyTypes.BUSINESS];
      
      definedCompanyTypes.forEach(companyType => {
        expect(defaultBusinessSettings.companySubtypes).toHaveProperty(companyType);
      });
    });

    it('should not have subtypes for API_PROVIDER company type', () => {
      expect(defaultBusinessSettings.companySubtypes).not.toHaveProperty(CompanyTypes.API_PROVIDER);
    });

    it('should handle INDIVIDUAL company type with empty subtypes', () => {
      expect(defaultBusinessSettings.companySubtypes[CompanyTypes.INDIVIDUAL]).toEqual([]);
      expect(Array.isArray(defaultBusinessSettings.companySubtypes[CompanyTypes.INDIVIDUAL])).toBe(true);
    });

    describe('LICENSED_ENTITY subtypes', () => {
      let licensedEntitySubtypes: any[];

      beforeEach(() => {
        licensedEntitySubtypes = defaultBusinessSettings.companySubtypes[CompanyTypes.LICENSED_ENTITY];
      });

      it('should have correct number of licensed entity subtypes', () => {
        expect(licensedEntitySubtypes).toHaveLength(14);
      });

      it('should contain all expected licensed entity subtypes', () => {
        const expectedSubtypes = [
          'Commercial Bank',
          'Merchant Bank', 
          'Non-interest Bank',
          'Microfinance Bank',
          'Finance House',
          'Payments Solutions Services Provider',
          'Super Agent',
          'Mobile Money Operator',
          'Switch and Processor',
          'Payments Solutions Services',
          'Payments Terminal Services Provider',
          'Insurance',
          'Capital Market Operator',
          'Others'
        ];

        expectedSubtypes.forEach(expectedSubtype => {
          const subtype = licensedEntitySubtypes.find(s => s.value === expectedSubtype);
          expect(subtype).toBeDefined();
          expect(subtype.default).toBe(true);
        });
      });

      it('should have consistent structure for all licensed entity subtypes', () => {
        licensedEntitySubtypes.forEach(subtype => {
          expect(subtype).toHaveProperty('value');
          expect(subtype).toHaveProperty('default');
          expect(typeof subtype.value).toBe('string');
          expect(typeof subtype.default).toBe('boolean');
          expect(subtype.default).toBe(true);
        });
      });
    });

    describe('BUSINESS subtypes', () => {
      let businessSubtypes: any[];

      beforeEach(() => {
        businessSubtypes = defaultBusinessSettings.companySubtypes[CompanyTypes.BUSINESS];
      });

      it('should have correct number of business subtypes', () => {
        expect(businessSubtypes).toHaveLength(11);
      });

      it('should contain all expected business subtypes', () => {
        const expectedSubtypes = [
          'Telecommunications',
          'Manufacturer',
          'Healthcare',
          'Logistics',
          'Real Estate',
          'Entertainment',
          'Hospitality',
          'Technology',
          'Medical',
          'Public Sector',
          'Others'
        ];

        expectedSubtypes.forEach(expectedSubtype => {
          const subtype = businessSubtypes.find(s => s.value === expectedSubtype);
          expect(subtype).toBeDefined();
          expect(subtype.default).toBe(true);
        });
      });

      it('should have consistent structure for all business subtypes', () => {
        businessSubtypes.forEach(subtype => {
          expect(subtype).toHaveProperty('value');
          expect(subtype).toHaveProperty('default');
          expect(typeof subtype.value).toBe('string');
          expect(typeof subtype.default).toBe('boolean');
          expect(subtype.default).toBe(true);
        });
      });
    });

    it('should have Others subtype for both LICENSED_ENTITY and BUSINESS', () => {
      const licensedEntityOthers = defaultBusinessSettings.companySubtypes[CompanyTypes.LICENSED_ENTITY].find(s => s.value === 'Others');
      const businessOthers = defaultBusinessSettings.companySubtypes[CompanyTypes.BUSINESS].find(s => s.value === 'Others');
      
      expect(licensedEntityOthers).toBeDefined();
      expect(businessOthers).toBeDefined();
      expect(licensedEntityOthers!.default).toBe(true);
      expect(businessOthers!.default).toBe(true);
    });

    it('should not have duplicate subtypes within each company type', () => {
      Object.entries(defaultBusinessSettings.companySubtypes).forEach(([, subtypes]: [string, any[]]) => {
        const values = subtypes.map(s => s.value);
        const uniqueValues = [...new Set(values)];
        expect(uniqueValues).toHaveLength(values.length);
      });
    });
  });

  describe('Data consistency', () => {
    it('should have uneditable fields matching non-editable KYB requirements', () => {
      const nonEditableKybFields = defaultBusinessSettings.kybRequirements
        .filter(req => !req.editable)
        .map(req => req.name);
      
      expect(defaultBusinessSettings.uneditableFields).toEqual(
        expect.arrayContaining(nonEditableKybFields)
      );
    });

    it('should ensure all uneditable fields have corresponding KYB requirements', () => {
      const kybFieldNames = defaultBusinessSettings.kybRequirements.map(req => req.name);
      
      defaultBusinessSettings.uneditableFields.forEach(field => {
        expect(kybFieldNames).toContain(field);
      });
    });

    it('should have valid CompanyTypes enum references', () => {
      const companyTypeKeys = Object.keys(defaultBusinessSettings.companySubtypes);
      const validCompanyTypes = Object.values(CompanyTypes);
      
      companyTypeKeys.forEach(key => {
        expect(validCompanyTypes).toContain(key);
      });
    });
  });
});