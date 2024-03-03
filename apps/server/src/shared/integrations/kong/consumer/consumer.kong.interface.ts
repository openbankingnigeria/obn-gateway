export interface CreateConsumerRequest {
  username: string;
  custom_id: string;
  tags?: string[];
}

export interface CreateConsumerResponse extends CreateConsumerRequest {
  id: string;
  created_at: number;
}

export interface UpdateConsumerAclResponse {
  id: string;
  created_at: number;
}

export interface Acl {
  group: string;
  created_at: number;
  id: string;
  consumer?: { id: string };
}

export interface ConsumerKey {
  key: string;
  created_at: number;
  tags: string[] | null;
  ttl: number | null;
  id: string;
  consumer: {
    id: string;
  } | null;
}

export interface CreateConsumerKeyResponse extends ConsumerKey {}

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
  } | null;
}

export interface ListRequest {
  size?: number;
  offset?: number;
  tags?: string;
}

export interface ListResponse<T> {
  data: T[];
  next: string;
  offset: string;
}

export interface ListPluginsRequest extends Omit<ListRequest, 'tags'> {}

export interface ListConsumersResponse extends ListResponse<Consumer> {}
export interface ListConsumerKeysResponse extends ListResponse<ConsumerKey> {}
export interface ListAclsResponse extends ListResponse<Acl> {}
