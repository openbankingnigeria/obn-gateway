export interface ListRequest {
  size?: number;
  offset?: number;
  tags?: string | string[];
}

export interface ListResponse<T> {
  data: T[];
  next: string;
}

export interface Route {
  hosts: string[];
  id: string;
  name: string;
  paths: string[];
  methods: string[];
  service: {
    id: string;
  };
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

export interface CreateRouteRequest {
  name: string;
  protocols: string[];
  methods: string[];
  hosts: string[];
  paths: string[];
  headers: {
    [k: string]: string[];
  };
  https_redirect_status_code: number;
  regex_priority: number;
  strip_path: boolean;
  path_handling: string;
  preserve_host: boolean;
  request_buffering: boolean;
  response_buffering: boolean;
  tags: string[];
  service: {
    id: string;
  };
}
export interface CreateRouteResponse extends Route {}

export interface UpdateRouteRequest extends CreateRouteRequest {}
export interface UpdateRouteResponse extends CreateRouteResponse {}

export interface ListRoutesRequest extends ListRequest {}
export interface ListRoutesResponse extends ListResponse<Route> {}

export interface CreatePluginRequest {
  name: string;
  enabled: boolean;
  route?: { id: string };
}
export interface CreatePluginResponse extends Plugin {}

export interface ListPluginsRequest extends ListRequest {}
export interface ListPluginsResponse extends ListResponse<Plugin> {}
