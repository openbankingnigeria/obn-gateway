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
  loading?: boolean;
  dataList?: any[];
  searchQuery?: string;
  next: () => void;
};

export interface ConsumerDetailsProps {
  status: string
  dataList: any[]
  searchQuery?: string
}

export interface SectionsProps {
  rawData: any[];
  altData?: any;
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

export interface PermissionValue {
  permission: string;
  options: PermissionOptionsProps[]
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

export interface PermissionOptionsProps {
  id: string;
  label: string;
  value: string;
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

export interface PermissionCardProps {
  label: string;
  permissions: PermissionValue[];
  value: string;
  changePermissions: Dispatch<SetStateAction<PermissionValue[]>>;
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