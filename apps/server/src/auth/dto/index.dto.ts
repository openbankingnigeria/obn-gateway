import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import {
  authConfig,
  authValidationErrors,
} from 'src/common/constants/auth/auth.config';
import { CompanyRoles, CompanyTypes } from 'src/users/types';

export class ForgotPasswordDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStructureMismatch(property),
  })
  password: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStructureMismatch(property),
  })
  @IsString()
  confirmPassword: string;
}

export class LoginDto extends ForgotPasswordDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStructureMismatch(property),
  })
  password: string;
}

export class SignupDto extends LoginDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @MinLength(authConfig.minNameLength, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustBeOfLength(
        property,
        authConfig.minNameLength,
      ),
  })
  @Matches(/^[A-Za-z]+$/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  firstName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStructureMismatch(property),
  })
  confirmPassword: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @MinLength(authConfig.minNameLength, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustBeOfLength(
        property,
        authConfig.minNameLength,
      ),
  })
  @Matches(/^[A-Za-z]+$/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  lastName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  country: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsMobilePhone('en-NG', undefined, {
    message: authValidationErrors.dto.invalidPhone,
  })
  phone: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  companyName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEnum(CompanyTypes)
  companyType: CompanyTypes;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEnum(CompanyRoles)
  companyRole: CompanyRoles;
}
