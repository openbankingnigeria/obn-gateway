import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;
}

export class UpdatePasswordDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsOptional()
  @IsStrongPassword()
  @IsString()
  newPassword: string;
}
