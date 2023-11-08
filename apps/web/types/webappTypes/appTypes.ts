import { Dispatch, SetStateAction } from "react";

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
  next: () => void;
};

export interface InviteMembersProps {
  roles: any[];
  close: () => void;
}

export interface InviteMembersButtonProps {
  roles: any[];
}

export interface CreateRolePageProps {
  close: () => void;
  next: () => void;
}

export interface PermissionOptionsProps {
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
  changeValues: Dispatch<SetStateAction<PermissionOptionsProps[]>>
}

export interface PermissionValue {
  permission: string;
  options: PermissionOptionsProps[]
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