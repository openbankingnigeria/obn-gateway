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
          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
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
          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestNestedDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
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
          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
        });
      });

      describe('and validation fails', () => {
        it('should throw IBadRequestException with structured errors when validation fails', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              name: 'Name should not be empty',
              email: 'Email must be a valid email address'
            },
            message: 'Validation Error.'
          });
        });

        it('should structure multiple validation errors correctly', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              name: 'Name is required',
              email: 'Invalid email format',
              age: 'Age must be a number'
            },
            message: 'Validation Error.'
          });
        });

        it('should handle nested validation errors with children', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestNestedDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              profile: {
                name: 'Profile name is required',
                email: 'Invalid profile email'
              }
            },
            message: 'Validation Error.'
          });
        });

        it('should prioritize required constraint errors in exception message', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              name: 'Name is required'
            },
            message: 'Validation Error.'
          });
        });

        it('should prioritize type constraint errors when no required errors present', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestTypeDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              age: 'Age must be a number'
            },
            message: 'Validation Error.'
          });
        });

        it('should prioritize structure constraint errors when no required/type errors present', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, metadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestStructureDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              email: 'Email format is invalid'
            },
            message: 'Validation Error.'
          });
        });

        it('should fallback to first constraint when no priority matches', async () => {
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
          
          const mockError = new Error('Validation Error.');
          mockedIBadRequestException.mockImplementation(() => {
            throw mockError;
          });

          await expect(pipe.transform(inputValue, mockMetadata)).rejects.toThrow(mockError);

          expect(mockedPlainToInstance).toHaveBeenCalledTimes(1);
          expect(mockedPlainToInstance).toHaveBeenCalledWith(TestRequiredDto, inputValue);
          expect(mockedValidate).toHaveBeenCalledTimes(1);
          expect(mockedValidate).toHaveBeenCalledWith(transformedInstance, {});
          expect(mockedIBadRequestException).toHaveBeenCalledTimes(1);
          expect(mockedIBadRequestException).toHaveBeenCalledWith({
            data: {
              customField: 'Custom validation failed'
            },
            message: 'Validation Error.'
          });
        });
      });
    });
  });

  describe('getMessage (private method)', () => {
    describe('when constraints contain required validation errors', () => {
      it('should return required constraint message when isNotEmpty is present', () => {
        const constraints = {
          isNotEmpty: 'Field is required',
          isString: 'Field must be string',
          isEmail: 'Invalid email format'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field is required');
      });

      it('should prioritize required constraints over other types', () => {
        const constraints = {
          minLength: 'Field too short',
          isNumber: 'Field must be number',
          isNotEmpty: 'Field cannot be empty',
          isEmail: 'Invalid email'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field cannot be empty');
      });
    });

    describe('when constraints contain type validation errors', () => {
      it('should return type constraint message when isString is present', () => {
        const constraints = {
          isString: 'Field must be a string',
          minLength: 'Field too short',
          isEmail: 'Invalid email format'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a string');
      });

      it('should return type constraint message when isNumber is present', () => {
        const constraints = {
          isNumber: 'Field must be a number',
          isEmail: 'Invalid email format'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a number');
      });

      it('should return type constraint message when isBoolean is present', () => {
        const constraints = {
          isBoolean: 'Field must be a boolean',
          maxLength: 'Field too long'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a boolean');
      });

      it('should return type constraint message when isDateString is present', () => {
        const constraints = {
          isDateString: 'Field must be a valid date string',
          matches: 'Field format is invalid'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a valid date string');
      });

      it('should return type constraint message when isEnum is present', () => {
        const constraints = {
          isEnum: 'Field must be a valid enum value',
          isStrongPassword: 'Password not strong enough'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a valid enum value');
      });

      it('should prioritize type constraints over structure constraints', () => {
        const constraints = {
          isEmail: 'Invalid email format',
          minLength: 'Field too short',
          isString: 'Field must be string',
          matches: 'Field pattern invalid'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be string');
      });
    });

    describe('when constraints contain structure validation errors', () => {
      it('should return structure constraint message when isEmail is present', () => {
        const constraints = {
          isEmail: 'Invalid email format',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Invalid email format');
      });

      it('should return structure constraint message when minLength is present', () => {
        const constraints = {
          minLength: 'Field must be at least 3 characters',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be at least 3 characters');
      });

      it('should return structure constraint message when maxLength is present', () => {
        const constraints = {
          maxLength: 'Field cannot exceed 50 characters',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field cannot exceed 50 characters');
      });

      it('should return structure constraint message when isStrongPassword is present', () => {
        const constraints = {
          isStrongPassword: 'Password must contain uppercase, lowercase, number and special character',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Password must contain uppercase, lowercase, number and special character');
      });

      it('should return structure constraint message when matches is present', () => {
        const constraints = {
          matches: 'Field must match the required pattern',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must match the required pattern');
      });

      it('should return structure constraint message when isMobilePhone is present', () => {
        const constraints = {
          isMobilePhone: 'Field must be a valid mobile phone number',
          customValidator: 'Custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Field must be a valid mobile phone number');
      });
    });

    describe('when constraints contain no priority matches', () => {
      it('should return first constraint message as fallback', () => {
        const constraints = {
          customValidator1: 'First custom validation failed',
          customValidator2: 'Second custom validation failed',
          customValidator3: 'Third custom validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('First custom validation failed');
      });

      it('should handle empty constraints object', () => {
        const constraints = {};
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBeUndefined();
      });

      it('should handle constraints with unknown validation types', () => {
        const constraints = {
          unknownValidator: 'Unknown validation failed',
          anotherUnknown: 'Another unknown validation failed'
        };
        
        const result = pipe['getMessage'](constraints);
        
        expect(result).toBe('Unknown validation failed');
      });
    });
  });

  describe('structureErrors (private method)', () => {
    describe('when errors have no children', () => {
      it('should structure simple validation errors correctly', () => {
        const validationError = new ValidationError();
        validationError.property = 'email';
        validationError.constraints = { isEmail: 'Email must be valid' };
        
        const result = pipe['structureErrors']([validationError]);
        
        expect(result).toEqual({
          email: 'Email must be valid'
        });
      });

      it('should handle multiple errors for same property', () => {
        const validationError = new ValidationError();
        validationError.property = 'password';
        validationError.constraints = { 
          minLength: 'Password too short',
          isStrongPassword: 'Password not strong enough'
        };
        
        const result = pipe['structureErrors']([validationError]);
        
        expect(result).toEqual({
          password: 'Password too short'
        });
      });

      it('should handle errors for multiple properties', () => {
        const emailError = new ValidationError();
        emailError.property = 'email';
        emailError.constraints = { isEmail: 'Invalid email' };
        
        const nameError = new ValidationError();
        nameError.property = 'name';
        nameError.constraints = { isNotEmpty: 'Name is required' };
        
        const result = pipe['structureErrors']([emailError, nameError]);
        
        expect(result).toEqual({
          email: 'Invalid email',
          name: 'Name is required'
        });
      });
    });

    describe('when errors have children (nested objects)', () => {
      it('should recursively structure nested validation errors', () => {
        const childError1 = new ValidationError();
        childError1.property = 'name';
        childError1.constraints = { isNotEmpty: 'Name is required' };
        
        const childError2 = new ValidationError();
        childError2.property = 'email';
        childError2.constraints = { isEmail: 'Invalid email' };
        
        const parentError = new ValidationError();
        parentError.property = 'profile';
        parentError.children = [childError1, childError2];
        
        const result = pipe['structureErrors']([parentError]);
        
        expect(result).toEqual({
          profile: {
            name: 'Name is required',
            email: 'Invalid email'
          }
        });
      });

      it('should handle deeply nested validation errors', () => {
        const deepChildError = new ValidationError();
        deepChildError.property = 'city';
        deepChildError.constraints = { isNotEmpty: 'City is required' };
        
        const addressError = new ValidationError();
        addressError.property = 'address';
        addressError.children = [deepChildError];
        
        const profileError = new ValidationError();
        profileError.property = 'profile';
        profileError.children = [addressError];
        
        const result = pipe['structureErrors']([profileError]);
        
        expect(result).toEqual({
          profile: {
            address: {
              city: 'City is required'
            }
          }
        });
      });

      it('should handle mixed errors with both constraints and children', () => {
        const childError = new ValidationError();
        childError.property = 'theme';
        childError.constraints = { isNotEmpty: 'Theme is required' };
        
        const parentError = new ValidationError();
        parentError.property = 'settings';
        parentError.constraints = { isNotEmpty: 'Settings object is required' };
        parentError.children = [childError];
        
        const result = pipe['structureErrors']([parentError]);
        
        expect(result).toEqual({
          settings: 'Settings object is required'
        });
      });
    });

    describe('when errors array is empty', () => {
      it('should return empty object for empty errors array', () => {
        const result = pipe['structureErrors']([]);
        
        expect(result).toEqual({});
      });
    });

    describe('when processing complex error structures', () => {
      it('should handle array validation errors', () => {
        const arrayItemError = new ValidationError();
        arrayItemError.property = '0';
        arrayItemError.constraints = { isString: 'Array item must be string' };
        
        const arrayError = new ValidationError();
        arrayError.property = 'items';
        arrayError.children = [arrayItemError];
        
        const result = pipe['structureErrors']([arrayError]);
        
        expect(result).toEqual({
          items: {
            '0': 'Array item must be string'
          }
        });
      });

      it('should handle conditional validation errors', () => {
        const conditionalError1 = new ValidationError();
        conditionalError1.property = 'field1';
        conditionalError1.constraints = { isNotEmpty: 'Field1 is required when condition is met' };
        
        const conditionalError2 = new ValidationError();
        conditionalError2.property = 'field2';
        conditionalError2.constraints = { isString: 'Field2 must be string when present' };
        
        const result = pipe['structureErrors']([conditionalError1, conditionalError2]);
        
        expect(result).toEqual({
          field1: 'Field1 is required when condition is met',
          field2: 'Field2 must be string when present'
        });
      });
    });
  });

  describe('toValidate (private method)', () => {
    describe('when metatype is a primitive type', () => {
      it('should return false for String type', () => {
        const result = pipe['toValidate'](String);
        
        expect(result).toBe(false);
      });

      it('should return false for Boolean type', () => {
        const result = pipe['toValidate'](Boolean);
        
        expect(result).toBe(false);
      });

      it('should return false for Number type', () => {
        const result = pipe['toValidate'](Number);
        
        expect(result).toBe(false);
      });

      it('should return false for Array type', () => {
        const result = pipe['toValidate'](Array);
        
        expect(result).toBe(false);
      });

      it('should return false for Object type', () => {
        const result = pipe['toValidate'](Object);
        
        expect(result).toBe(false);
      });
    });

    describe('when metatype is a custom class/DTO', () => {
      it('should return true for custom DTO classes', () => {
        const result = pipe['toValidate'](TestRequiredDto);
        
        expect(result).toBe(true);
      });

      it('should return true for custom entity classes', () => {
        const result = pipe['toValidate'](TestNestedDto);
        
        expect(result).toBe(true);
      });

      it('should return true for custom interface implementations', () => {
        class CustomClass {
          customProperty: string;
        }
        
        const result = pipe['toValidate'](CustomClass);
        
        expect(result).toBe(true);
      });
    });

    describe('when metatype is undefined or null', () => {
      it('should return false for undefined metatype', () => {
        const result = pipe['toValidate'](undefined);
        
        expect(result).toBe(true);
      });

      it('should return false for null metatype', () => {
        const result = pipe['toValidate'](null);
        
        expect(result).toBe(true);
      });
    });
  });
});