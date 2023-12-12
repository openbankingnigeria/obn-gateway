import { Expose } from 'class-transformer';
import { IsArray, IsObject, ValidateIf, ValidateNested } from 'class-validator';

export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  meta?: any;
}

export class ResponseMetaDTO<
  T = {
    totalNumberOfRecords: number;
    totalNumberOfPages: number;
    pageNumber: number;
    pageSize: number;
  },
> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @Expose()
  totalNumberOfRecords: number;

  @Expose()
  totalNumberOfPages: number;

  @Expose()
  pageNumber: number;

  @Expose()
  pageSize: number;
}

export class ResponseDTO<T> {
  constructor(partial: Partial<T>) {
    Object.assign(this, partial);
  }

  @Expose()
  status: string;

  @Expose()
  message: string;

  @Expose()
  @ValidateIf(
    (obj) => Array.isArray(obj.field) || typeof obj.field === 'object',
  )
  @IsArray()
  @IsObject()
  @ValidateNested({ each: true })
  data: any;

  @Expose()
  @IsObject()
  meta: ResponseMetaDTO;
}

export class ResponseFormatter {
  public static success<T>(
    message: string,
    data?: T,
    meta?: any,
  ): ResponseDTO<ApiResponse<T>> {
    return new ResponseDTO<ApiResponse<T>>({
      status: 'success',
      message,
      data,
      meta,
    });
  }

  static error(message: string): ApiResponse<null> {
    return {
      status: 'error',
      message,
      data: null,
    };
  }
}
