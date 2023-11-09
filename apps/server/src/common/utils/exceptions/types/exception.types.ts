export interface ErrorResponse {
  status: number;
  timestamp: string;
  success: boolean;
  name?: string;
  stack?: any;
  message?: string;
  _meta?: any;
}
