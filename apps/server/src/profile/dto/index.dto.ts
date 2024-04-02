import { Profile } from '@common/database/entities';
import { GetUserResponseDTO } from '@users/dto/index.dto';
import { userConfig, userErrors } from '@users/user.errors';
import { Expose, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsObject,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
  @IsString()
  @MinLength(userConfig.minNameLength, {
    message: ({ property }) =>
      userErrors.dto.valueMustBeOfLength(property, userConfig.minNameLength),
  })
  @Matches(/^[a-z-]+$/gi, {
    message: ({ property }) =>
      userErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  firstName: string;

  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
  @IsString()
  @MinLength(userConfig.minNameLength, {
    message: ({ property }) =>
      userErrors.dto.valueMustBeOfLength(property, userConfig.minNameLength),
  })
  @Matches(/^[a-z-]+$/gi, {
    message: ({ property }) =>
      userErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  lastName: string;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsStrongPassword()
  @IsString()
  newPassword: string;

  @IsStrongPassword()
  @IsString()
  confirmPassword: string;
}

export class UpdateTwoFADto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}

export class GetProfileResponseDTO {
  constructor(partial: Partial<Profile>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  companyRole: string;

  @Expose()
  phone: string;

  @Expose()
  country: string;

  @Expose()
  @IsObject()
  @Type(() => GetUserResponseDTO)
  user: GetUserResponseDTO;

  @Expose()
  createdAt: Date;
}

export class GenerateTwoFaResponseDTO {
  constructor(partial: Partial<{ otpAuthURL: string; qrCodeImage: string }>) {
    Object.assign(this, partial);
  }

  @Expose()
  otpAuthURL: string;

  @Expose()
  qrCodeImage: string;
}
