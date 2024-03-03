import { AuditLog } from '@common/database/entities';
import { GetCompanyResponseDTO } from '@company/dto/index.dto';
import { GetUserResponseDTO } from '@users/dto/index.dto';
import { Expose, Type } from 'class-transformer';
import { IsObject } from 'class-validator';

export class GetAuditLogResponseDTO {
  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }

  @Expose()
  id: string;

  @Expose()
  event: string;

  @Expose()
  @IsObject()
  details: any;

  @Expose()
  @IsObject()
  @Type(() => GetCompanyResponseDTO)
  company: GetCompanyResponseDTO;

  @Expose()
  @IsObject()
  @Type(() => GetUserResponseDTO)
  user: GetUserResponseDTO;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  deletedAt: Date;
}
