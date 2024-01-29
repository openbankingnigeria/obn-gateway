import { Dispatch, MouseEventHandler, SetStateAction } from "react";

export interface DashboardMetricCardProps {
  title: string;
  amount: number;
  isGreen?: boolean;
  amountUnit?: string;
  containerStyle?: string;
  labels: string[];
  data: number[];
}

export interface searchParamsProps {
  status?: string;
  path?: string
  search_query?: string;
  rows?: number;
  page?: number;
  total_elements?: number;
  search_apis?: string;
  date_sent?: string;
  date_filter?: string;
  type?: string;
  request_method?: string;
  tier?: string;
  role?: string;
  two_fa?: string;
  token?: string;
  alt_data?: any;
  api_id?: string;
}

export interface ParamsProps {
  id?: string;
}

export interface UrlParamsProps {
  searchParams?: searchParamsProps;
  params?: ParamsProps
}

export interface TableHeaderProps {
  accessor: string
  header: string
}

export interface TableProps {
  tableHeaders: TableHeaderProps[],
  rawData: any[],
  filters: any[];
  altData?: any[];
  rows: number;
  page: number;
  totalElements?: number;
  totalElementsInPage?: number;
  totalPages: number;
  searchQuery?: string;
  dataList?: any[];
  path?: string;
  removePagination?: boolean;
}

export interface ConfirmActionProps {
  close: () => void;
  type?: string;
  reason?: string;
  setReason?: Dispatch<SetStateAction<string>>;
  loading?: boolean;
  dataList?: any[];
  searchQuery?: string;
  next: () => void;
};

export interface ConsumerDetailsProps {
  rawData: any;
  status: string
  dataList: any[]
  profileData?: any;
  searchQuery?: string
}

export interface SectionsProps {
  rawData: any[];
  altData?: any;
  profileData?: any;
  listData?: any;
  tableHeaders: any[];
  filters: any[];
  rows: number;
  page: number;
  details?: any;
  totalElements?: number;
  totalElementsInPage?: number;
  totalPages: number;
  statusList: any[];
  requestMethodList?: any[];
  tierList?: any[];
}

export interface ConsumerSectionsProps extends SectionsProps {
  path: string;
}

export interface ConsumerBusinessDetailsProps {
  rawData: any;
}

export interface ActivitySectionsProps {
  path: string;
  rawData: any;
}

export interface ApiConfigurationProps {
  close: () => void;
  loading?: boolean;
  next: any;
  data?: any;
  endpoint_url: string;
  parameters: string;
  snis: SnisProps[];
  hosts: HostsProps[];
  headers: HeadersProps[];
  setEndpointUrl: Dispatch<SetStateAction<string>>;
  setParameters: Dispatch<SetStateAction<string>>;
  setSnis: Dispatch<SetStateAction<SnisProps[]>>;
  setHost: Dispatch<SetStateAction<HostsProps[]>>;
  setHeaders: Dispatch<SetStateAction<HeadersProps[]>>;
};

export interface InviteMembersProps {
  roles: any[];
  close: () => void;
  email: string;
  role: string;
  setEmail: Dispatch<SetStateAction<string>>;
  setRole: Dispatch<SetStateAction<string>>;
  next: any;
  loading: boolean;
}

export interface InviteMembersButtonProps {
  roles: any[];
}

export interface PermissionOptionsProps {
  id: string;
  label: string;
  value: string;
}

export interface PermissionValue {
  permission: string;
  options: PermissionOptionsProps[]
}

export interface ApiPermissionOptionsProps {
  id: string;
  label: string;
  method: string;
}

export interface ApiPermissionValue {
  collection: string;
  api_options: ApiPermissionOptionsProps[]
}

export interface RoleComponentsProps {
  close: () => void;
  data?: any;
  list?: any;
  next: any;
}

export interface CreateRolePageProps extends RoleComponentsProps {
  role_name: string;
  description: string;
  loading?: boolean;
  permissions: PermissionValue[];
  setRoleName: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setPermissions: Dispatch<SetStateAction<PermissionValue[]>>;
}

export interface AddBusinessInformationProps {
  close: () => void;
  openModal: string;
  setOpenModal: Dispatch<SetStateAction<string>>;
  next: () => void;
}

export interface confirmCancelProps {
  close: () => void;
  next: () => void;
}

export interface PermissionSelectorProps {
  placeholder?: string;
  parentIsSelected: boolean;
  name: string;
  options: any[];
  clickerStyle?: string;
  containerStyle?: string;
  loading?: boolean;
  fieldStyle?: string;
  values: PermissionOptionsProps[];
  optionStyle?: string;
  changeValues: Dispatch<SetStateAction<PermissionOptionsProps[]>>;
}

export interface ApiPermissionSelectorProps {
  name: string;
  options: any[];
  setCount?: Dispatch<SetStateAction<number>>;
  values: string[];
  changeValues: Dispatch<SetStateAction<string[]>>;
}

export interface PermissionCardProps {
  label: string;
  permissions: PermissionValue[];
  value: string;
  changePermissions: Dispatch<SetStateAction<PermissionValue[]>>;
  options: PermissionOptionsProps[];
}

export interface ApiPermissionCardProps {
  label: string;
  apiIds: string[];
  value: string;
  apiList?: string[];
  changeApiIds: Dispatch<SetStateAction<string[]>>;
  options: PermissionOptionsProps[];
}

export interface MemberCardProps {
  id: number;
  name: string;
  email: string;
}
export interface RolesMemberCardProps {
  members?: MemberCardProps[];
  member: MemberCardProps;
  changeMembers?: Dispatch<SetStateAction<MemberCardProps[]>>;
}

export interface HeadersProps {
  id: number;
  name: string;
  value: string;
}

export interface KeyValueProps {
  id: number;
  key: string;
  value: string;
}

export interface HostsProps {
  id: number;
  value: string;
}

export interface SnisProps {
  id: number;
  value: string;
}

export interface APIConfigurationContainerProps {
  data: any[];
  handleInputChange: (value: string, obj: any, key: any, type: string) => void;
  handleRemove: (type: string, value: string | number) => void;
  handleAdd: (type: string) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  label?: string;
  type?: string;
}

export interface APIConfigurationProps {
  rawData: any;
  profileData?: any;
}

export interface CreateRoleButtonProps {
  permissions_list: any;
}

export interface EnableTwoFactorAuthProps { 
  close: MouseEventHandler<HTMLButtonElement>;
  next: () => void;
  qrcode_key: string;
  qrcode_image: string;
  setCode: Dispatch<React.SetStateAction<string>>;
  loading: boolean
}

export interface EditAPIPermissionProps {
  rawData: any;
  apiList?: any;
  searchQuery?: string;
}

export interface AddAPIPermissionsProps extends RoleComponentsProps {
  loading?: boolean;
  api_ids: string[];
  setRefresh?: Dispatch<SetStateAction<boolean>>;
  searchQuery?: string;
  apiList?: any[];
  setApiIds: Dispatch<SetStateAction<string[]>>;
}