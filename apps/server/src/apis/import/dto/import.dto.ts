import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsArray,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { Expose, Transform } from 'class-transformer';

export class ImportApiSpecDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  specName?: string;

  @IsString()
  @IsNotEmpty()
  specFile: string;

  @IsOptional()
  @IsUUID('4')
  collectionId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  collectionName?: string;

  @IsOptional()
  @IsUrl({ host_whitelist: [/.*/] })
  upstreamBaseUrl?: string;

  @IsOptional()
  @IsUrl({ host_whitelist: [/.*/] })
  downstreamBaseUrl?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  enableByDefault?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value.split(',').map(v => v.trim());
      }
    }
    return value;
  })
  defaultTiers?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  requireAuth?: boolean;
}

export class ImportResultDto {
  @Expose()
  importId: string;

  @Expose()
  collectionId: string;

  @Expose()
  totalEndpoints: number;

  @Expose()
  successCount: number;

  @Expose()
  failedCount: number;

  @Expose()
  status: 'completed' | 'partial' | 'failed';

  @Expose()
  errors: ImportErrorDto[];
}

export class ImportErrorDto {
  @Expose()
  endpoint: string;

  @Expose()
  error: string;

  @Expose()
  @IsOptional()
  details?: any;
}

export class ImportHistoryItemDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  specFormat: string;

  @Expose()
  specVersion: string;

  @Expose()
  importStatus: string;

  @Expose()
  importedCount: number;

  @Expose()
  failedCount: number;

  @Expose()
  collectionId: string;

  @Expose()
  environment: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}

export class ImportDetailDto extends ImportHistoryItemDto {
  @Expose()
  parsedMetadata: any;

  @Expose()
  errorLog: ImportErrorDto[];

  @Expose()
  originalSpec?: string;
}
