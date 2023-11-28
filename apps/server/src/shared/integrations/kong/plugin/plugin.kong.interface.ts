export interface ListRequest {
  size?: number;
  offset?: number;
  tags?: string;
}

export interface ListResponse<T> {
  data: T[];
  next: string;
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
}

export interface CreatePluginRequest {
  name: string;
  enabled: boolean;
  route?: { id: string };
  config?: { [k: string]: any };
}
export interface CreatePluginResponse extends Plugin {}

export interface ListPluginsRequest extends ListRequest {}
export interface ListPluginsResponse extends ListResponse<Plugin> {}

export enum KONG_PLUGINS {
  REQUEST_TERMINATION = 'request-termination',
  HTTP_LOG = 'http-log',
}
