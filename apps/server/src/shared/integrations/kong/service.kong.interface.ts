export interface Service {
  id: string;
  created_at: number;
  updated_at: number;
  host: string;
  connect_timeout: number;
  protocol: string;
  name: string;
  enabled: boolean;
  read_timeout: number;
  port: number;
  path: string;
  retries: number;
  write_timeout: number;
  tags: null | string[];
  client_certificate: null;
}

export interface CreateServiceRequest {
  host: string;
  connect_timeout: number;
  protocol: string;
  name: string;
  enabled: boolean;
  read_timeout: number;
  port: number;
  path: string;
  retries: number;
  write_timeout: number;
  tags: null | string[];
  client_certificate: null;
  url: string;
}

export interface CreateServiceResponse extends CreateServiceRequest {
  id: string;
  created_at: number;
}

export interface UpdateServiceRequest extends CreateServiceRequest {}

export interface UpdateServiceResponse extends CreateServiceResponse {}

export interface ListServicesRequest {
  size: number;
  offset: number;
  tags: string;
}

export interface ListServicesResponse {
  data: Service[];
  next: string;
}

export interface GetServiceResponse extends Service {}
