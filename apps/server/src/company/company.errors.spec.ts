import { companyErrors } from './company.errors';

describe('Company Errors', () => {
  describe('Static error messages', () => {
    it('should return correct invalidFileType error message', () => {
      expect(companyErrors.invalidFileType).toBe(
        'File must be either a .jpg, .jpeg, .png or .pdf file'
      );
    });

    it('should return correct companyAlreadyVerified error message', () => {
      expect(companyErrors.companyAlreadyVerified).toBe(
        'Your business has already been verified. You cannot update this information'
      );
    });

    it('should return correct noKybDetailsFound error message', () => {
      expect(companyErrors.noKybDetailsFound).toBe(
        'No KYB details were found for this company'
      );
    });

    it('should return correct reasonNotProvided error message', () => {
      expect(companyErrors.reasonNotProvided).toBe(
        'A reason must be provided when denying a company KYB approval request.'
      );
    });
  });

  describe('Error functions with parameters', () => {
    describe('fileTooLarge', () => {
      it('should return correct message for file size in bytes', () => {
        const maxFileSize = 5242880; // 5MB in bytes
        const result = companyErrors.fileTooLarge(maxFileSize);
        
        expect(result).toBe('Files uploaded must be less than 5MB');
      });

      it('should handle different file sizes correctly', () => {
        expect(companyErrors.fileTooLarge(1048576)).toBe('Files uploaded must be less than 1MB'); // 1MB
        expect(companyErrors.fileTooLarge(2097152)).toBe('Files uploaded must be less than 2MB'); // 2MB
        expect(companyErrors.fileTooLarge(10485760)).toBe('Files uploaded must be less than 10MB'); // 10MB
      });

      it('should handle fractional MB sizes', () => {
        const maxFileSize = 1572864; // 1.5MB in bytes
        const result = companyErrors.fileTooLarge(maxFileSize);
        
        expect(result).toBe('Files uploaded must be less than 1.5MB');
      });

      it('should handle very small file sizes', () => {
        const maxFileSize = 512000; // ~0.49MB
        const result = companyErrors.fileTooLarge(maxFileSize);
        
        expect(result).toBe('Files uploaded must be less than 0.48828125MB');
      });
    });

    describe('companyNotFound', () => {
      it('should return correct message with company ID', () => {
        const companyId = 'company-123';
        const result = companyErrors.companyNotFound(companyId);
        
        expect(result).toBe('No company found with ID - company-123');
      });

      it('should handle undefined company ID', () => {
        const result = companyErrors.companyNotFound(undefined);
        
        expect(result).toBe('No company found with ID - undefined');
      });

      it('should handle empty string company ID', () => {
        const result = companyErrors.companyNotFound('');
        
        expect(result).toBe('No company found with ID - ');
      });

      it('should handle null company ID', () => {
        const result = companyErrors.companyNotFound(null as any);
        
        expect(result).toBe('No company found with ID - null');
      });
    });

    describe('businessNotFoundOnRegistry', () => {
      it('should return correct message with RC number', () => {
        const rcNumber = 'RC123456';
        const result = companyErrors.businessNotFoundOnRegistry(rcNumber);
        
        expect(result).toBe('No business with RC number - RC123456 found in registry.');
      });

      it('should handle different RC number formats', () => {
        expect(companyErrors.businessNotFoundOnRegistry('12345')).toBe(
          'No business with RC number - 12345 found in registry.'
        );
        expect(companyErrors.businessNotFoundOnRegistry('RC-123-456')).toBe(
          'No business with RC number - RC-123-456 found in registry.'
        );
        expect(companyErrors.businessNotFoundOnRegistry('BN1234567')).toBe(
          'No business with RC number - BN1234567 found in registry.'
        );
      });

      it('should handle empty RC number', () => {
        const result = companyErrors.businessNotFoundOnRegistry('');
        
        expect(result).toBe('No business with RC number -  found in registry.');
      });
    });
  });

  describe('Error function edge cases', () => {
    describe('fileTooLarge edge cases', () => {
      it('should handle zero file size', () => {
        const result = companyErrors.fileTooLarge(0);
        
        expect(result).toBe('Files uploaded must be less than 0MB');
      });

      it('should handle negative file size', () => {
        const result = companyErrors.fileTooLarge(-1048576);
        
        expect(result).toBe('Files uploaded must be less than -1MB');
      });

      it('should handle very large file sizes', () => {
        const maxFileSize = 1073741824; // 1GB in bytes
        const result = companyErrors.fileTooLarge(maxFileSize);
        
        expect(result).toBe('Files uploaded must be less than 1024MB');
      });
    });

    describe('Parameter type handling', () => {
      it('should handle numeric strings for RC numbers', () => {
        const result = companyErrors.businessNotFoundOnRegistry('123456');
        
        expect(result).toBe('No business with RC number - 123456 found in registry.');
      });

      it('should handle special characters in company ID', () => {
        const companyId = 'company-123-abc-!@#';
        const result = companyErrors.companyNotFound(companyId);
        
        expect(result).toBe('No company found with ID - company-123-abc-!@#');
      });
    });
  });

  describe('Error object structure', () => {
    it('should have all expected error properties', () => {
      const expectedProperties = [
        'fileTooLarge',
        'invalidFileType',
        'companyAlreadyVerified',
        'noKybDetailsFound',
        'companyNotFound',
        'businessNotFoundOnRegistry',
        'reasonNotProvided'
      ];

      expectedProperties.forEach(prop => {
        expect(companyErrors).toHaveProperty(prop);
      });
    });

    it('should have correct types for error properties', () => {
      expect(typeof companyErrors.fileTooLarge).toBe('function');
      expect(typeof companyErrors.invalidFileType).toBe('string');
      expect(typeof companyErrors.companyAlreadyVerified).toBe('string');
      expect(typeof companyErrors.noKybDetailsFound).toBe('string');
      expect(typeof companyErrors.companyNotFound).toBe('function');
      expect(typeof companyErrors.businessNotFoundOnRegistry).toBe('function');
      expect(typeof companyErrors.reasonNotProvided).toBe('string');
    });

    it('should not have unexpected properties', () => {
      const expectedPropertyCount = 7;
      const actualPropertyCount = Object.keys(companyErrors).length;
      
      expect(actualPropertyCount).toBe(expectedPropertyCount);
    });
  });
});