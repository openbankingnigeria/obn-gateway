import { RoleStatuses } from '@common/database/entities';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  status: RoleStatuses;

  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  status: RoleStatuses;
}

export class SetRolePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissions: string[];
}
