import {
  IsEmail,
  IsEnum,
  IsMobilePhone,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import {
  authConfig,
  authValidationErrors,
} from 'src/common/constants/auth/auth.config';
import { CompanyRoles, CompanyTypes } from 'src/users/types';

const passwordConfig = {
  minLength: authConfig.minPasswordLength,
  minLowercase: authConfig.minPasswordLowercase,
  minNumbers: authConfig.minPasswordNumber,
  minSymbols: authConfig.minPasswordSpecialCharacter,
  minUppercase: authConfig.minPasswordUppercase,
};

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
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  confirmPassword: string;
}

export class LoginDto extends ForgotPasswordDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
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
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  @IsString()
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

export class SetupDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  firstName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  lastName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  @IsString()
  confirmPassword: string;
}
