export interface CreateConsumerRequest {
  username: string;
  custom_id: string;
  tags: string[];
}

export interface CreateConsumerResponse extends CreateConsumerRequest {
  id: string;
  created_at: number;
}

export interface Consumer {
  custom_id: string;
  created_at: number;
  id: string;
  tags: string[];
  username: string;
  updated_at: number;
  name: string;
  protocols: string[];
  https_redirect_status_code: number;
  regex_priority: number;
  strip_path: boolean;
  path_handling: string;
  preserve_host: true;
  service: {
    id: string;
  };
}

export interface ListConsumersResponse {
  next: string;
  data: Consumer[];
}
