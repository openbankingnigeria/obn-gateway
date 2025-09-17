import { companyValidationErrors } from './company.config';

describe('Company Validation Errors', () => {
  describe('dto.isRequired', () => {
    it('should return correct required message for property name', () => {
      const result = companyValidationErrors.dto.isRequired('companyName');
      
      expect(result).toBe('companyName is required.');
    });

    it('should handle different property names', () => {
      expect(companyValidationErrors.dto.isRequired('email')).toBe('email is required.');
      expect(companyValidationErrors.dto.isRequired('phoneNumber')).toBe('phoneNumber is required.');
      expect(companyValidationErrors.dto.isRequired('address')).toBe('address is required.');
      expect(companyValidationErrors.dto.isRequired('rcNumber')).toBe('rcNumber is required.');
    });

    it('should handle property names with spaces', () => {
      const result = companyValidationErrors.dto.isRequired('business address');
      
      expect(result).toBe('business address is required.');
    });

    it('should handle property names with special characters', () => {
      expect(companyValidationErrors.dto.isRequired('company-name')).toBe('company-name is required.');
      expect(companyValidationErrors.dto.isRequired('email_address')).toBe('email_address is required.');
      expect(companyValidationErrors.dto.isRequired('phone.number')).toBe('phone.number is required.');
    });

    it('should handle empty string property name', () => {
      const result = companyValidationErrors.dto.isRequired('');
      
      expect(result).toBe(' is required.');
    });

    it('should handle camelCase property names', () => {
      expect(companyValidationErrors.dto.isRequired('businessName')).toBe('businessName is required.');
      expect(companyValidationErrors.dto.isRequired('registrationNumber')).toBe('registrationNumber is required.');
    });
  });

  describe('dto.typeMismatch', () => {
    describe('alphabets type', () => {
      it('should return correct message for alphabets type', () => {
        const result = companyValidationErrors.dto.typeMismatch('firstName', 'alphabets');
        
        expect(result).toBe('firstName must contain only alphabets.');
      });

      it('should handle different property names with alphabets type', () => {
        expect(companyValidationErrors.dto.typeMismatch('lastName', 'alphabets')).toBe('lastName must contain only alphabets.');
        expect(companyValidationErrors.dto.typeMismatch('companyName', 'alphabets')).toBe('companyName must contain only alphabets.');
      });
    });

    describe('numbers type', () => {
      it('should return correct message for numbers type', () => {
        const result = companyValidationErrors.dto.typeMismatch('phoneNumber', 'numbers');
        
        expect(result).toBe('phoneNumber must contain only numbers.');
      });

      it('should handle different property names with numbers type', () => {
        expect(companyValidationErrors.dto.typeMismatch('rcNumber', 'numbers')).toBe('rcNumber must contain only numbers.');
        expect(companyValidationErrors.dto.typeMismatch('taxId', 'numbers')).toBe('taxId must contain only numbers.');
      });
    });

    describe('alphabets and numbers type', () => {
      it('should return correct message for alphabets and numbers type', () => {
        const result = companyValidationErrors.dto.typeMismatch('username', 'alphabets and numbers');
        
        expect(result).toBe('username must contain only alphabets and numbers.');
      });

      it('should handle different property names with alphabets and numbers type', () => {
        expect(companyValidationErrors.dto.typeMismatch('accountNumber', 'alphabets and numbers')).toBe('accountNumber must contain only alphabets and numbers.');
        expect(companyValidationErrors.dto.typeMismatch('referenceCode', 'alphabets and numbers')).toBe('referenceCode must contain only alphabets and numbers.');
      });
    });

    describe('all type combinations', () => {
      it('should work with all valid type combinations for same property', () => {
        const property = 'testField';
        
        expect(companyValidationErrors.dto.typeMismatch(property, 'alphabets')).toBe('testField must contain only alphabets.');
        expect(companyValidationErrors.dto.typeMismatch(property, 'numbers')).toBe('testField must contain only numbers.');
        expect(companyValidationErrors.dto.typeMismatch(property, 'alphabets and numbers')).toBe('testField must contain only alphabets and numbers.');
      });
    });
  });

  describe('Edge cases', () => {
    describe('Empty and special property names', () => {
      it('should handle empty property name with typeMismatch', () => {
        const result = companyValidationErrors.dto.typeMismatch('', 'alphabets');
        
        expect(result).toBe(' must contain only alphabets.');
      });

      it('should handle property names with numbers', () => {
        expect(companyValidationErrors.dto.typeMismatch('field1', 'numbers')).toBe('field1 must contain only numbers.');
        expect(companyValidationErrors.dto.typeMismatch('field123', 'alphabets')).toBe('field123 must contain only alphabets.');
      });

      it('should handle property names with mixed case', () => {
        expect(companyValidationErrors.dto.typeMismatch('CompanyName', 'alphabets')).toBe('CompanyName must contain only alphabets.');
        expect(companyValidationErrors.dto.typeMismatch('PHONE_NUMBER', 'numbers')).toBe('PHONE_NUMBER must contain only numbers.');
      });
    });

    describe('Long property names', () => {
      it('should handle very long property names', () => {
        const longPropertyName = 'veryLongPropertyNameThatExceedsNormalLimits';
        
        expect(companyValidationErrors.dto.isRequired(longPropertyName)).toBe(`${longPropertyName} is required.`);
        expect(companyValidationErrors.dto.typeMismatch(longPropertyName, 'alphabets')).toBe(`${longPropertyName} must contain only alphabets.`);
      });
    });
  });

  describe('Function parameter validation', () => {
    it('should handle all three type parameters correctly', () => {
      const types: Array<'alphabets' | 'numbers' | 'alphabets and numbers'> = [
        'alphabets',
        'numbers', 
        'alphabets and numbers'
      ];

      types.forEach(type => {
        const result = companyValidationErrors.dto.typeMismatch('testProperty', type);
        expect(result).toBe(`testProperty must contain only ${type}.`);
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Object structure validation', () => {
    it('should have correct nested structure', () => {
      expect(companyValidationErrors).toHaveProperty('dto');
      expect(companyValidationErrors.dto).toHaveProperty('isRequired');
      expect(companyValidationErrors.dto).toHaveProperty('typeMismatch');
    });

    it('should have correct function types', () => {
      expect(typeof companyValidationErrors.dto.isRequired).toBe('function');
      expect(typeof companyValidationErrors.dto.typeMismatch).toBe('function');
    });

    it('should have expected number of properties', () => {
      expect(Object.keys(companyValidationErrors)).toHaveLength(1);
      expect(Object.keys(companyValidationErrors.dto)).toHaveLength(2);
    });

    it('should not have unexpected properties', () => {
      const expectedProperties = ['dto'];
      const actualProperties = Object.keys(companyValidationErrors);
      
      expect(actualProperties).toEqual(expectedProperties);
      
      const expectedDtoProperties = ['isRequired', 'typeMismatch'];
      const actualDtoProperties = Object.keys(companyValidationErrors.dto);
      
      expect(actualDtoProperties).toEqual(expectedDtoProperties);
    });
  });

  describe('Function return type consistency', () => {
    it('should always return strings', () => {
      const isRequiredResult = companyValidationErrors.dto.isRequired('test');
      const typeMismatchResult = companyValidationErrors.dto.typeMismatch('test', 'alphabets');
      
      expect(typeof isRequiredResult).toBe('string');
      expect(typeof typeMismatchResult).toBe('string');
    });

    it('should return non-empty strings', () => {
      const isRequiredResult = companyValidationErrors.dto.isRequired('test');
      const typeMismatchResult = companyValidationErrors.dto.typeMismatch('test', 'numbers');
      
      expect(isRequiredResult.length).toBeGreaterThan(0);
      expect(typeMismatchResult.length).toBeGreaterThan(0);
    });

    it('should return properly formatted sentences', () => {
      const isRequiredResult = companyValidationErrors.dto.isRequired('test');
      const typeMismatchResult = companyValidationErrors.dto.typeMismatch('test', 'alphabets and numbers');
      
      expect(isRequiredResult).toMatch(/\.$$/); // ends with period
      expect(typeMismatchResult).toMatch(/\.$$/); // ends with period
      expect(isRequiredResult).toMatch(/^[a-zA-Z]/); // starts with letter
      expect(typeMismatchResult).toMatch(/^[a-zA-Z]/); // starts with letter
    });
  });
});