import { Permission, Role, RoleStatuses } from '@common/database/entities';
import { PERMISSIONS } from '@permissions/types';
import { Expose, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  status: RoleStatuses;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
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
  @IsNotEmpty({ each: true })
  @ArrayNotEmpty()
  @ArrayUnique()
  permissions: string[];
}

export class GetPermissionResponseDTO {
  constructor(partial: Partial<Permission>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

  @Expose()
  description: string;

  @Expose()
  createdAt: Date;
}

export class GetRoleResponseDTO {
  constructor(partial: Partial<Role>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  slug: string;

  @Expose()
  description: string;

  @Expose()
  status: RoleStatuses;

  @Expose()
  @IsObject()
  @Type(() => GetRoleResponseDTO)
  parent: GetRoleResponseDTO;

  @Expose()
  @IsArray()
  @Type(() => GetPermissionResponseDTO)
  permissions: GetPermissionResponseDTO[];

  @Expose()
  createdAt: Date;
}

export class GetStatsResponseDTO {
  constructor(partial: Partial<{ count: number; value: string }>) {
    Object.assign(this, partial);
  }

  @Expose()
  count: number;

  @Expose()
  value: string;
}
