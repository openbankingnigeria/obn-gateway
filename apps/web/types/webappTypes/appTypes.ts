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
  id?: string;
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

export interface ConsumerSectionsProps {
  path: string;
  rawData: any[];
  tableHeaders: any[];
  filters: any[];
  rows: number;
  page: number;
  totalElements?: number;
  totalElementsInPage?: number;
  totalPages: number;
  statusList: any[];
}

export interface ActivitySectionsProps {
  path: string;
  rawData: any;
}