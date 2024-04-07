import {
  IsAlphanumeric,
  IsEmail,
  IsIn,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { authConfig, authValidationErrors } from '@auth/auth.config';
import { CompanyTypes } from '@common/database/constants';
import { Expose } from 'class-transformer';
import { companyValidationErrors } from '@company/company.config';

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

export class LoginDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}

export class LoginResponseDto {
  constructor(partial: LoginResponseDto) {
    Object.assign(this, partial);
  }

  @Expose()
  tokenType: 'Bearer';

  @Expose()
  accessToken: string;

  @Expose()
  refreshToken: string;

  @Expose()
  expiresIn: number;
}

export class TwoFADto extends ForgotPasswordDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  password: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class BaseSignupDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsStrongPassword(passwordConfig, {
    message: ({ property }) =>
      authValidationErrors.dto.passwordStrengthMismatch(property),
  })
  password: string;

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
  @Matches(/^[a-z-]+$/gi, {
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
  @Matches(/^[a-z-]+$/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  lastName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsPhoneNumber('NG', {
    message: authValidationErrors.dto.invalidPhone,
  })
  phone: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @IsIn(
    Object.values(CompanyTypes).filter(
      (type) => type !== CompanyTypes.API_PROVIDER,
    ),
  )
  companyType: CompanyTypes;
}

export class IndividualSignupDto extends BaseSignupDto {
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/\d/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'numbers'),
  })
  accountNumber: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  @Length(11, 11)
  @Matches(/\d/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'numbers'),
  })
  bvn: string;
}
export class BusinessSignupDto extends BaseSignupDto {
  @IsOptional()
  @IsString()
  @Length(10, 10)
  @Matches(/\d/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'numbers'),
  })
  accountNumber: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  companyName: string;

  @IsOptional()
  @IsAlphanumeric('en-US', {
    message: ({ property }) =>
      companyValidationErrors.dto.typeMismatch(
        property,
        'alphabets and numbers',
      ),
  })
  @Length(15, 15, { message: 'rcNumber must be exactly 15 digits long.' })
  rcNumber: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  companySubtype: string;
}

export class LicensedEntitySignupDto extends BaseSignupDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  companyName: string;

  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  @IsString()
  companySubtype: string;
}

export const signupDtos: Record<CompanyTypes, any> = {
  individual: IndividualSignupDto,
  business: BusinessSignupDto,
  ['licensed-entity']: LicensedEntitySignupDto,
  'api-provider': '',
};

export class SetupDto {
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
  @Matches(/^[a-z-]+$/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  firstName: string;

  @Matches(/^[a-z-]+$/gi, {
    message: ({ property }) =>
      authValidationErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
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

export class ResendOtpDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  email: string;
}

export class VerifyEmailDto extends ResendOtpDto {
  @IsNotEmpty({
    message: ({ property }) => authValidationErrors.dto.isRequired(property),
  })
  otp: string;
}
