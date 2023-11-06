export interface ApiResponse<T> {
  status: string;
  message: string;
  data?: T;
  _meta?: any;
}

export class ResponseFormatter {
  public static success<T>(
    message: string,
    data?: T,
    meta?: any,
  ): ApiResponse<T> {
    if ((data as any)?.password) {
      delete (data as any)?.password;
    }
    return {
      status: 'success',
      message,
      data,
      _meta: meta,
    };
  }

  static error(message: string): ApiResponse<null> {
    return {
      status: 'error',
      message,
      data: null,
    };
  }
}
