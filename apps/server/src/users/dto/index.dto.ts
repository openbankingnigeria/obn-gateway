import { GetCompanyResponseDTO } from '@company/dto/index.dto';
import { GetRoleResponseDTO } from '@roles/dto/index.dto';
import { userConfig, userErrors } from '@users/user.errors';
import { Expose, Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { User, UserStatuses } from 'src/common/database/entities';

export class CreateUserDto {
  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  roleId: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(userConfig.minNameLength, {
    message: ({ property }) =>
      userErrors.dto.valueMustBeOfLength(property, userConfig.minNameLength),
  })
  @Matches(/^[A-Za-z]+$/gi, {
    message: ({ property }) =>
      userErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  firstName: string;

  @IsOptional()
  @IsString()
  @MinLength(userConfig.minNameLength, {
    message: ({ property }) =>
      userErrors.dto.valueMustBeOfLength(property, userConfig.minNameLength),
  })
  @Matches(/^[A-Za-z]+$/gi, {
    message: ({ property }) =>
      userErrors.dto.valueMustContainOnlyType(property, 'alphabets'),
  })
  lastName: string;

  @IsOptional()
  @IsString()
  roleId: string;

  @IsOptional()
  @IsString()
  @IsEnum(UserStatuses)
  status: UserStatuses;
}

export class GetUserResponseDTO {
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  twofaEnabled: boolean;

  @Expose()
  status: UserStatuses;

  @Expose()
  emailVerified: boolean;

  @Expose()
  otp: string;

  @Expose()
  @IsObject()
  @Type(() => GetRoleResponseDTO)
  role: GetRoleResponseDTO;

  @Expose()
  @IsObject()
  @Type(() => GetCompanyResponseDTO)
  company: GetCompanyResponseDTO;

  @Expose()
  createdAt: Date;
}

export class GetStatsResponseDTO {
  constructor(partial: GetStatsResponseDTO) {
    Object.assign(this, partial);
  }

  @Expose()
  count: number;

  @Expose()
  value: string;
}
