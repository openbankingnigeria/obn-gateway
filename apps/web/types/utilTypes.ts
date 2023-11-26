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