import { settingsErrors } from './settings.errors';

describe('Settings Errors', () => {
  describe('DTO error functions', () => {
    describe('valueMustContainOnlyType', () => {
      it('should return correct message for alphabets type', () => {
        const propertyName = 'firstName';
        const result = settingsErrors.dto.valueMustContainOnlyType(propertyName, 'alphabets');
        
        expect(result).toBe('firstName value must contain only alphabets.');
      });

      it('should return correct message for numbers type', () => {
        const propertyName = 'phoneNumber';
        const result = settingsErrors.dto.valueMustContainOnlyType(propertyName, 'numbers');
        
        expect(result).toBe('phoneNumber value must contain only numbers.');
      });

      it('should handle different property names', () => {
        expect(settingsErrors.dto.valueMustContainOnlyType('lastName', 'alphabets')).toBe(
          'lastName value must contain only alphabets.'
        );
        expect(settingsErrors.dto.valueMustContainOnlyType('accountNumber', 'numbers')).toBe(
          'accountNumber value must contain only numbers.'
        );
        expect(settingsErrors.dto.valueMustContainOnlyType('middleName', 'alphabets')).toBe(
          'middleName value must contain only alphabets.'
        );
      });

      it('should handle empty property name', () => {
        const result = settingsErrors.dto.valueMustContainOnlyType('', 'alphabets');
        
        expect(result).toBe(' value must contain only alphabets.');
      });

      it('should handle special characters in property name', () => {
        const propertyName = 'property_name-123';
        const result = settingsErrors.dto.valueMustContainOnlyType(propertyName, 'numbers');
        
        expect(result).toBe('property_name-123 value must contain only numbers.');
      });
    });

    describe('valueMustBeOfLength', () => {
      it('should return correct message for different lengths', () => {
        expect(settingsErrors.dto.valueMustBeOfLength('password', 8)).toBe(
          'password value should have at least 8 characters.'
        );
        expect(settingsErrors.dto.valueMustBeOfLength('username', 3)).toBe(
          'username value should have at least 3 characters.'
        );
        expect(settingsErrors.dto.valueMustBeOfLength('token', 16)).toBe(
          'token value should have at least 16 characters.'
        );
      });

      it('should handle zero length', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('field', 0);
        
        expect(result).toBe('field value should have at least 0 characters.');
      });

      it('should handle large length values', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('description', 1000);
        
        expect(result).toBe('description value should have at least 1000 characters.');
      });

      it('should handle negative length values', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('field', -5);
        
        expect(result).toBe('field value should have at least -5 characters.');
      });

      it('should handle empty property name', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('', 10);
        
        expect(result).toBe(' value should have at least 10 characters.');
      });

      it('should handle decimal length values', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('code', 5.5);
        
        expect(result).toBe('code value should have at least 5.5 characters.');
      });
    });

    describe('isRequired', () => {
      it('should return correct message for required field', () => {
        const propertyName = 'email';
        const result = settingsErrors.dto.isRequired(propertyName);
        
        expect(result).toBe('email is required.');
      });

      it('should handle different property names', () => {
        expect(settingsErrors.dto.isRequired('firstName')).toBe('firstName is required.');
        expect(settingsErrors.dto.isRequired('lastName')).toBe('lastName is required.');
        expect(settingsErrors.dto.isRequired('phoneNumber')).toBe('phoneNumber is required.');
        expect(settingsErrors.dto.isRequired('address')).toBe('address is required.');
      });

      it('should handle empty property name', () => {
        const result = settingsErrors.dto.isRequired('');
        
        expect(result).toBe(' is required.');
      });

      it('should handle property names with spaces', () => {
        const result = settingsErrors.dto.isRequired('first name');
        
        expect(result).toBe('first name is required.');
      });

      it('should handle property names with special characters', () => {
        const result = settingsErrors.dto.isRequired('property_name-123');
        
        expect(result).toBe('property_name-123 is required.');
      });

      it('should handle camelCase property names', () => {
        expect(settingsErrors.dto.isRequired('emailAddress')).toBe('emailAddress is required.');
        expect(settingsErrors.dto.isRequired('phoneNumber')).toBe('phoneNumber is required.');
        expect(settingsErrors.dto.isRequired('dateOfBirth')).toBe('dateOfBirth is required.');
      });
    });
  });

  describe('Settings-specific error functions', () => {
    describe('settingNotFound', () => {
      it('should return correct message with setting name', () => {
        const settingName = 'email_configuration';
        const result = settingsErrors.settingNotFound(settingName);
        
        expect(result).toBe('Setting with name email_configuration was not found.');
      });

      it('should handle different setting names', () => {
        expect(settingsErrors.settingNotFound('general_settings')).toBe(
          'Setting with name general_settings was not found.'
        );
        expect(settingsErrors.settingNotFound('user_agreements')).toBe(
          'Setting with name user_agreements was not found.'
        );
        expect(settingsErrors.settingNotFound('email_templates')).toBe(
          'Setting with name email_templates was not found.'
        );
      });

      it('should handle empty setting name', () => {
        const result = settingsErrors.settingNotFound('');
        
        expect(result).toBe('Setting with name  was not found.');
      });

      it('should handle undefined setting name', () => {
        const result = settingsErrors.settingNotFound(undefined as any);
        
        expect(result).toBe('Setting with name undefined was not found.');
      });

      it('should handle null setting name', () => {
        const result = settingsErrors.settingNotFound(null as any);
        
        expect(result).toBe('Setting with name null was not found.');
      });

      it('should handle setting names with special characters', () => {
        const settingName = 'setting-name_123.config';
        const result = settingsErrors.settingNotFound(settingName);
        
        expect(result).toBe('Setting with name setting-name_123.config was not found.');
      });

      it('should handle very long setting names', () => {
        const longSettingName = 'very_long_setting_name_that_exceeds_normal_length_limits_and_continues_for_testing_purposes';
        const result = settingsErrors.settingNotFound(longSettingName);
        
        expect(result).toBe(`Setting with name ${longSettingName} was not found.`);
      });
    });
  });

  describe('Error function edge cases', () => {
    describe('DTO functions with unusual inputs', () => {
      it('should handle numeric property names', () => {
        const result = settingsErrors.dto.isRequired('123');
        
        expect(result).toBe('123 is required.');
      });

      it('should handle boolean-like property names', () => {
        expect(settingsErrors.dto.isRequired('true')).toBe('true is required.');
        expect(settingsErrors.dto.isRequired('false')).toBe('false is required.');
      });

      it('should handle whitespace-only property names', () => {
        const result = settingsErrors.dto.valueMustContainOnlyType('   ', 'alphabets');
        
        expect(result).toBe('    value must contain only alphabets.');
      });

      it('should handle very large length values', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('field', Number.MAX_SAFE_INTEGER);
        
        expect(result).toBe(`field value should have at least ${Number.MAX_SAFE_INTEGER} characters.`);
      });
    });

    describe('Parameter type coercion', () => {
      it('should handle non-string property names through string coercion', () => {
        const result = settingsErrors.dto.isRequired(123 as any);
        
        expect(result).toBe('123 is required.');
      });

      it('should handle object property names through string coercion', () => {
        const result = settingsErrors.dto.isRequired({} as any);
        
        expect(result).toBe('[object Object] is required.');
      });

      it('should handle array property names through string coercion', () => {
        const result = settingsErrors.dto.isRequired(['test'] as any);
        
        expect(result).toBe('test is required.');
      });

      it('should handle non-number length values through number coercion', () => {
        const result = settingsErrors.dto.valueMustBeOfLength('field', '10' as any);
        
        expect(result).toBe('field value should have at least 10 characters.');
      });
    });
  });

  describe('Error object structure', () => {
    it('should have all expected error properties', () => {
      const expectedProperties = [
        'dto',
        'settingNotFound'
      ];

      expectedProperties.forEach(prop => {
        expect(settingsErrors).toHaveProperty(prop);
      });
    });

    it('should have correct types for top-level error properties', () => {
      expect(typeof settingsErrors.dto).toBe('object');
      expect(typeof settingsErrors.settingNotFound).toBe('function');
    });

    it('should have all expected DTO error properties', () => {
      const expectedDtoProperties = [
        'valueMustContainOnlyType',
        'valueMustBeOfLength',
        'isRequired'
      ];

      expectedDtoProperties.forEach(prop => {
        expect(settingsErrors.dto).toHaveProperty(prop);
      });
    });

    it('should have correct types for DTO error properties', () => {
      expect(typeof settingsErrors.dto.valueMustContainOnlyType).toBe('function');
      expect(typeof settingsErrors.dto.valueMustBeOfLength).toBe('function');
      expect(typeof settingsErrors.dto.isRequired).toBe('function');
    });

    it('should not have unexpected top-level properties', () => {
      const expectedPropertyCount = 2; // dto and settingNotFound
      const actualPropertyCount = Object.keys(settingsErrors).length;
      
      expect(actualPropertyCount).toBe(expectedPropertyCount);
    });

    it('should not have unexpected DTO properties', () => {
      const expectedDtoPropertyCount = 3; // valueMustContainOnlyType, valueMustBeOfLength, isRequired
      const actualDtoPropertyCount = Object.keys(settingsErrors.dto).length;
      
      expect(actualDtoPropertyCount).toBe(expectedDtoPropertyCount);
    });
  });

  describe('Function signature validation', () => {
    describe('valueMustContainOnlyType function signature', () => {
      it('should accept both required parameters', () => {
        expect(() => {
          settingsErrors.dto.valueMustContainOnlyType('test', 'alphabets');
        }).not.toThrow();
      });

      it('should work with both valid property types', () => {
        expect(() => {
          settingsErrors.dto.valueMustContainOnlyType('test', 'alphabets');
          settingsErrors.dto.valueMustContainOnlyType('test', 'numbers');
        }).not.toThrow();
      });
    });

    describe('valueMustBeOfLength function signature', () => {
      it('should accept string and number parameters', () => {
        expect(() => {
          settingsErrors.dto.valueMustBeOfLength('test', 5);
        }).not.toThrow();
      });

      it('should work with various number types', () => {
        expect(() => {
          settingsErrors.dto.valueMustBeOfLength('test', 0);
          settingsErrors.dto.valueMustBeOfLength('test', 1.5);
          settingsErrors.dto.valueMustBeOfLength('test', -1);
        }).not.toThrow();
      });
    });

    describe('isRequired function signature', () => {
      it('should accept string parameter', () => {
        expect(() => {
          settingsErrors.dto.isRequired('test');
        }).not.toThrow();
      });
    });

    describe('settingNotFound function signature', () => {
      it('should accept string parameter', () => {
        expect(() => {
          settingsErrors.settingNotFound('test');
        }).not.toThrow();
      });
    });
  });

  describe('Error message consistency', () => {
    it('should maintain consistent message format for DTO errors', () => {
      const property = 'testProperty';
      
      // All DTO error messages should start with the property name
      expect(settingsErrors.dto.isRequired(property)).toStartWith(property);
      expect(settingsErrors.dto.valueMustBeOfLength(property, 5)).toStartWith(property);
      expect(settingsErrors.dto.valueMustContainOnlyType(property, 'alphabets')).toStartWith(property);
    });

    it('should maintain consistent message format for setting errors', () => {
      const settingName = 'testSetting';
      const result = settingsErrors.settingNotFound(settingName);
      
      expect(result).toContain('Setting with name');
      expect(result).toContain(settingName);
      expect(result).toEndWith('was not found.');
    });

    it('should use consistent punctuation', () => {
      expect(settingsErrors.dto.isRequired('test')).toEndWith('.');
      expect(settingsErrors.dto.valueMustBeOfLength('test', 5)).toEndWith('.');
      expect(settingsErrors.dto.valueMustContainOnlyType('test', 'alphabets')).toEndWith('.');
      expect(settingsErrors.settingNotFound('test')).toEndWith('.');
    });
  });
});