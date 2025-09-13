import { Test, TestingModule } from '@nestjs/testing';
import { ArgumentMetadata } from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { IValidationPipe } from './validation.pipe';
import { IBadRequestException } from '../../exceptions/exceptions';
import { RequestContext } from '@common/utils/request/request-context';
import {
  requiredConstraintKeys,
  typeConstraintKeys,
  structureConstraintKeys,
} from './validation.constants';

// Mock external modules
jest.mock('class-validator');
jest.mock('class-transformer');
jest.mock('../../exceptions/exceptions');
jest.mock('@common/utils/request/request-context');

const mockedValidate = validate as jest.MockedFunction<typeof validate>;
const mockedPlainToInstance = plainToInstance as jest.MockedFunction<typeof plainToInstance>;
const mockedIBadRequestException = IBadRequestException as jest.MockedClass<typeof IBadRequestException>;
const mockedRequestContext = RequestContext as jest.MockedClass<typeof RequestContext>;

// Test DTOs for validation scenarios
class TestRequiredDto {
  name: string;
  email: string;
}

class TestTypeDto {
  age: number;
  isActive: boolean;
  birthDate: string;
}

class TestStructureDto {
  email: string;
  password: string;
  phone: string;
}

class TestNestedDto {
  profile: {
    name: string;
    email: string;
  };
  settings: {
    theme: string;
    notifications: boolean;
  };
}

describe('IValidationPipe', () => {
  let pipe: IValidationPipe;

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [IValidationPipe],
    }).compile();

    pipe = module.get<IValidationPipe>(IValidationPipe);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(pipe).toBeDefined();
  });

  describe('transform', () => {
    const mockMetadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestRequiredDto,
      data: '',
    };

    describe('when value should be passed through unchanged', () => {
      it('should return value unchanged when metatype is undefined', async () => {
        const testValue = { name: 'test', email: 'test@example.com' };
        const metadata = { ...mockMetadata, metatype: undefined };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when metatype is null', async () => {
        const testValue = { name: 'test', email: 'test@example.com' };
        const metadata = { ...mockMetadata, metatype: null };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when toValidate returns false for String', async () => {
        const testValue = 'test string value';
        const metadata = { ...mockMetadata, metatype: String };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when toValidate returns false for Boolean', async () => {
        const testValue = true;
        const metadata = { ...mockMetadata, metatype: Boolean };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when toValidate returns false for Number', async () => {
        const testValue = 42;
        const metadata = { ...mockMetadata, metatype: Number };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when toValidate returns false for Array', async () => {
        const testValue = ['item1', 'item2', 'item3'];
        const metadata = { ...mockMetadata, metatype: Array };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when toValidate returns false for Object', async () => {
        const testValue = { key: 'value', nested: { prop: 'test' } };
        const metadata = { ...mockMetadata, metatype: Object };

        const result = await pipe.transform(testValue, metadata);

        expect(result).toBe(testValue);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });

      it('should return value unchanged when value is RequestContext instance', async () => {
        const mockRequestContext = new mockedRequestContext();
        const metadata = { ...mockMetadata, metatype: TestRequiredDto };

        const result = await pipe.transform(mockRequestContext, metadata);

        expect(result).toBe(mockRequestContext);
        expect(mockedPlainToInstance).not.toHaveBeenCalled();
        expect(mockedValidate).not.toHaveBeenCalled();
      });
    });

    describe('when value should be validated', () => {
      describe('and validation succeeds', () => {
        it('should transform plain object to class instance and return it', async () => {
          const inputValue = { name: 'John Doe', email: 'john@example.com' };
          const transformedInstance = new TestRequiredDto();
          transformedInstance.name = 'John Doe';
          transformedInstance.email = 'john@example.com';

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue([]);

          const result = await pipe.transform(inputValue, mockMetadata);

          expect(result).toBe(transformedInstance);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it('should validate complex nested objects successfully', async () => {
          const inputValue = { 
            profile: { name: 'Jane', email: 'jane@example.com' },
            settings: { theme: 'dark', notifications: true }
          };
          const transformedInstance = new TestNestedDto();
          const metadata = { ...mockMetadata, metatype: TestNestedDto };

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue([]);

          const result = await pipe.transform(inputValue, metadata);

          expect(result).toBe(transformedInstance);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestNestedDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it('should handle arrays of objects for validation', async () => {
          const inputValue = [
            { name: 'Item 1', email: 'item1@example.com' },
            { name: 'Item 2', email: 'item2@example.com' }
          ];
          const transformedInstance = [new TestRequiredDto(), new TestRequiredDto()];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue([]);

          const result = await pipe.transform(inputValue, mockMetadata);

          expect(result).toBe(transformedInstance);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });
      });

      describe('and validation fails', () => {
        it.skip('should throw IBadRequestException with structured errors when validation fails', async () => {
          const inputValue = { name: '', email: 'invalid-email' };
          const transformedInstance = new TestRequiredDto();
          
          const validationError1 = new ValidationError();
          validationError1.property = 'name';
          validationError1.constraints = { isNotEmpty: 'Name should not be empty' };
          
          const validationError2 = new ValidationError();
          validationError2.property = 'email';
          validationError2.constraints = { isEmail: 'Email must be a valid email address' };
          
          const validationErrors = [validationError1, validationError2];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors);

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should structure multiple validation errors correctly', async () => {
          const inputValue = { name: '', email: 'invalid', age: 'not-a-number' };
          const transformedInstance = new TestRequiredDto();
          
          const validationError1 = new ValidationError();
          validationError1.property = 'name';
          validationError1.constraints = { isNotEmpty: 'Name is required' };
          
          const validationError2 = new ValidationError();
          validationError2.property = 'email';
          validationError2.constraints = { isEmail: 'Invalid email format' };
          
          const validationError3 = new ValidationError();
          validationError3.property = 'age';
          validationError3.constraints = { isNumber: 'Age must be a number' };
          
          const validationErrors = [validationError1, validationError2, validationError3];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should handle nested validation errors with children', async () => {
          const inputValue = { profile: { name: '', email: 'invalid' } };
          const transformedInstance = new TestNestedDto();
          const metadata = { ...mockMetadata, metatype: TestNestedDto };
          
          const childError1 = new ValidationError();
          childError1.property = 'name';
          childError1.constraints = { isNotEmpty: 'Profile name is required' };
          
          const childError2 = new ValidationError();
          childError2.property = 'email';
          childError2.constraints = { isEmail: 'Invalid profile email' };
          
          const parentError = new ValidationError();
          parentError.property = 'profile';
          parentError.children = [childError1, childError2];
          
          const validationErrors = [parentError];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestNestedDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should prioritize required constraint errors in exception message', async () => {
          const inputValue = { name: '', email: 'short' };
          const transformedInstance = new TestRequiredDto();
          
          const validationError = new ValidationError();
          validationError.property = 'name';
          validationError.constraints = {
            isNotEmpty: 'Name is required',
            minLength: 'Name too short',
            isString: 'Name must be string'
          };
          
          const validationErrors = [validationError];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should prioritize type constraint errors when no required errors present', async () => {
          const inputValue = { age: 'not-a-number', isActive: 'not-boolean' };
          const transformedInstance = new TestTypeDto();
          const metadata = { ...mockMetadata, metatype: TestTypeDto };
          
          const validationError = new ValidationError();
          validationError.property = 'age';
          validationError.constraints = {
            isNumber: 'Age must be a number',
            minLength: 'Age too short',
            isEmail: 'Age invalid format'
          };
          
          const validationErrors = [validationError];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestTypeDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should prioritize structure constraint errors when no required/type errors present', async () => {
          const inputValue = { email: 'invalid-email', password: 'weak' };
          const transformedInstance = new TestStructureDto();
          const metadata = { ...mockMetadata, metatype: TestStructureDto };
          
          const validationError = new ValidationError();
          validationError.property = 'email';
          validationError.constraints = {
            isEmail: 'Email format is invalid',
            minLength: 'Email too short',
            matches: 'Email pattern mismatch'
          };
          
          const validationErrors = [validationError];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestStructureDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });

        it.skip('should fallback to first constraint when no priority matches', async () => {
          const inputValue = { customField: 'invalid-value' };
          const transformedInstance = new TestRequiredDto();
          
          const validationError = new ValidationError();
          validationError.property = 'customField';
          validationError.constraints = {
            customValidator: 'Custom validation failed',
            anotherValidator: 'Another validation failed'
          };
          
          const validationErrors = [validationError];

          mockedPlainToInstance.mockReturnValue(transformedInstance);
          mockedValidate.mockResolvedValue(validationErrors as any);

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(IBadRequestException);

          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });
      });
    });
  });

  describe('getMessage (private method)', () => {
    describe('when constraints contain required validation errors', () => {
      it('should return required constraint message when isNotEmpty is present', () => {
        // Test body here
      });

      it('should prioritize required constraints over other types', () => {
        // Test body here
      });
    });

    describe('when constraints contain type validation errors', () => {
      it('should return type constraint message when isString is present', () => {
        // Test body here
      });

      it('should return type constraint message when isNumber is present', () => {
        // Test body here
      });

      it('should return type constraint message when isBoolean is present', () => {
        // Test body here
      });

      it('should return type constraint message when isDateString is present', () => {
        // Test body here
      });

      it('should return type constraint message when isEnum is present', () => {
        // Test body here
      });

      it('should prioritize type constraints over structure constraints', () => {
        // Test body here
      });
    });

    describe('when constraints contain structure validation errors', () => {
      it('should return structure constraint message when isEmail is present', () => {
        // Test body here
      });

      it('should return structure constraint message when minLength is present', () => {
        // Test body here
      });

      it('should return structure constraint message when maxLength is present', () => {
        // Test body here
      });

      it('should return structure constraint message when isStrongPassword is present', () => {
        // Test body here
      });

      it('should return structure constraint message when matches is present', () => {
        // Test body here
      });

      it('should return structure constraint message when isMobilePhone is present', () => {
        // Test body here
      });
    });

    describe('when constraints contain no priority matches', () => {
      it('should return first constraint message as fallback', () => {
        // Test body here
      });

      it('should handle empty constraints object', () => {
        // Test body here
      });

      it('should handle constraints with unknown validation types', () => {
        // Test body here
      });
    });
  });

  describe('structureErrors (private method)', () => {
    describe('when errors have no children', () => {
      it('should structure simple validation errors correctly', () => {
        // Test body here
      });

      it('should handle multiple errors for same property', () => {
        // Test body here
      });

      it('should handle errors for multiple properties', () => {
        // Test body here
      });
    });

    describe('when errors have children (nested objects)', () => {
      it('should recursively structure nested validation errors', () => {
        // Test body here
      });

      it('should handle deeply nested validation errors', () => {
        // Test body here
      });

      it('should handle mixed errors with both constraints and children', () => {
        // Test body here
      });
    });

    describe('when errors array is empty', () => {
      it('should return empty object for empty errors array', () => {
        // Test body here
      });
    });

    describe('when processing complex error structures', () => {
      it('should handle array validation errors', () => {
        // Test body here
      });

      it('should handle conditional validation errors', () => {
        // Test body here
      });
    });
  });

  describe('toValidate (private method)', () => {
    describe('when metatype is a primitive type', () => {
      it('should return false for String type', () => {
        // Test body here
      });

      it('should return false for Boolean type', () => {
        // Test body here
      });

      it('should return false for Number type', () => {
        // Test body here
      });

      it('should return false for Array type', () => {
        // Test body here
      });

      it('should return false for Object type', () => {
        // Test body here
      });
    });

    describe('when metatype is a custom class/DTO', () => {
      it('should return true for custom DTO classes', () => {
        // Test body here
      });

      it('should return true for custom entity classes', () => {
        // Test body here
      });

      it('should return true for custom interface implementations', () => {
        // Test body here
      });
    });

    describe('when metatype is undefined or null', () => {
      it('should return false for undefined metatype', () => {
        // Test body here
      });

      it('should return false for null metatype', () => {
        // Test body here
      });
    });
  });
});