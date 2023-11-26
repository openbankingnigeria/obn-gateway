export interface HttpRequestProps {
  apiEndpoint: string;
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE' | 'PUT';
  headers: any;
  data: any;
  redirectTo?: string;
  noToast?: boolean;
};