export interface ErrorResponse {
  status: number;
  errors?: any;
  timestamp: string;
  success: boolean;
  name?: string;
  stack?: any;
  message?: string;
  type?: string;
}
