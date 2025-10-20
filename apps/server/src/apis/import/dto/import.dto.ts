import {
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsArray,
  IsUrl,
  IsNotEmpty,
} from 'class-validator';
import { Expose } from 'class-transformer';

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
  enableByDefault?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  defaultTiers?: string[];

  @IsOptional()
  @IsBoolean()
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
