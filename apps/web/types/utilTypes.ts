export interface PermissionItem {
  id: string;
  label: string;
  value: string;
}

export interface PermissionArrayItem {
  label: string;
  value: string;
  permission_options: PermissionItem[];
}

export interface ApiPermissionItem {
  id: string;
  label: string;
  method: string;
}

export interface ApiPermissionArrayItem {
  label: string;
  value: string;
  api_options: ApiPermissionItem[];
}