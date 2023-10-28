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