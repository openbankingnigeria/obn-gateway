import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { CompanyRoles, CompanyTypes } from 'src/users/types';

export class ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class LoginDto extends ForgotPasswordDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignupDto extends LoginDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CompanyTypes)
  companyType: CompanyTypes;

  @IsNotEmpty()
  @IsString()
  @IsEnum(CompanyRoles)
  companyRole: CompanyRoles;
}
