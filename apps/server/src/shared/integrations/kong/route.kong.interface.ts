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

export interface ListRoutesRequest {
  size?: number;
  offset?: number;
  tags?: string;
}

export interface ListRoutesResponse {
  data: Route[];
  next: string;
}
