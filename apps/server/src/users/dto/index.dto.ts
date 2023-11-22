import {
  userConfig,
  userErrors,
} from '@users/user.errors';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserStatuses } from 'src/common/database/entities';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
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

  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
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

  @IsNotEmpty()
  @IsString()
  roleId: string;
}

export class UpdateUserDto {
  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
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

  @IsNotEmpty({
    message: ({ property }) => userErrors.dto.isRequired(property),
  })
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
