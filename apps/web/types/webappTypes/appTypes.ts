import { Dispatch, SetStateAction } from "react";

export interface StatusSearchParamsProps {
  searchParams: { status: 'successful' | 'failed' | 'pending' };
}

export interface DashboardPageProps {
  searchParams: { datefilter?: string }
}

export interface DashboardMetricCardProps {
  title: string;
  amount: number;
  isGreen?: boolean;
  amountUnit?: string;
  containerStyle?: string;
  labels: string[];
  data: number[];
}

export interface FilterProps {
  status?: string;
  search_query?: string;
  rows: number;
  page: number;
  total_elements?: number ;
}

export interface ConsumersPageProps {
  searchParams: FilterProps;
}

export interface TableHeaderProps {
  accessor: string
  header: string
}

export interface TableProps {
  headerData: TableHeaderProps[],
  rawData: any[],
  filters: any[];
  rows: number;
  page: number;
  totalElements?: number;
  totalPages: number;
}

export interface ConfirmActionProps {
  close: () => void;
  type?: string;
  loading?: boolean;
  next: () => void;
};