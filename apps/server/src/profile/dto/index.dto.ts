import {
  userConfig,
  userErrors,
} from 'src/common/constants/errors/user.errors';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
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
