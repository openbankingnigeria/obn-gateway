export interface ListRequest {
  size?: number;
  offset?: number;
  tags?: string;
}

export interface ListResponse<T> {
  data: T[];
  next?: string;
}

export interface Plugin {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  instance_name: string;
  config: any;
  protocols: string[];
  enabled: boolean;
  tags: string[];
  route: { id: string } | null;
  consumer: { id: string } | null;
  service: { id: string } | null;
}

export interface CreatePluginRequest {
  name: string;
  enabled: boolean;
  route?: { id: string };
  config?: { [k: string]: any };
  tags?: string[];
}
export interface CreatePluginResponse extends Plugin {}

export interface ListPluginsRequest extends ListRequest {}
export interface ListPluginsResponse extends ListResponse<Plugin> {}

export enum KONG_PLUGINS {
  REQUEST_TERMINATION = 'request-termination',
  ACL = 'acl',
  HTTP_LOG = 'http-log',
  KEY_AUTH = 'key-auth',
  IP_RESTRICTION = 'ip-restriction',
  CORRELATION_ID = 'correlation-id',
  POST_FUNCTION = 'post-function',
  REQUEST_TRANSFORMER = 'request-transformer',
  OBN_AUTHORIZATION = 'obn-authorization',
}
