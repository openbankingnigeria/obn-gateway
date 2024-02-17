import { APICallsProps, ReportingDataProps, UsersStatProps } from "@/types/dataTypes";

export const API_COLLECTIONS_STATS = [
  {
    id: 1,
    title: 'COLLECTIONS',
    amount: 0
  },
  {
    id: 2,
    title: 'APIs',
    amount: 0
  },
];

export const USERS_STATS = ({
  active,
  inactive,
  pending
}: UsersStatProps) => [
  {
    id: 1,
    title: active?.value,
    amount: active?.count
  },
  {
    id: 2,
    title: inactive?.value,
    amount: inactive?.count
  },
  {
    id: 3,
    title: pending?.value,
    amount: pending?.count
  },
];

export const REPORTING_DATA = ({
  total_processed,
  successful,
  failed,
  request_latency,
  gateway_latency,
  latency
}: ReportingDataProps) => {
    return([
    {
      id: 1,
      title: 'Total Processed',
      amount: total_processed || 0,
      // isGreen: false,
      // amountUnit: '',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 2,
      title: 'Successful',
      amount: successful || 0,
      // isGreen: false,
      // amountUnit: '',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 3,
      title: 'Failed',
      amount: failed || 0,
      // isGreen: false,
      // amountUnit: '',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 4,
      title: 'Avg. Request Latency',
      amount: request_latency || 0,
      // isGreen: false,
      amountUnit: 'ms',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 5,
      title: 'Avg. Gateway Latency',
      amount: gateway_latency || 0,
      // isGreen: false,
      amountUnit: 'ms',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
    {
      id: 6,
      title: 'Avg. Latency',
      amount: latency || 0,
      // isGreen: false,
      amountUnit: 'ms',
      // labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
      // data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ])
};

export const API_CONSUMERS_TABLE_DATA = [
  {
    id: 1,
    title: 'Total',
    amount: 0,
    isGreen: false,
    amountUnit: '',
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 2,
    title: 'Active',
    amount: 0,
    isGreen: false,
    amountUnit: '',
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 3,
    title: 'Rejected',
    amount: 0,
    isGreen: false,
    amountUnit: '',
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 4,
    title: 'Inactive',
    amount: 0,
    isGreen: false,
    amountUnit: '',
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];

export const API_CALLS_DATA = ({
  total,
  success,
  failed
}: APICallsProps) => [
  {
    id: 1,
    title: 'Total Processed',
    amount: total,
    isGreen: false,
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 2,
    title: 'Success Count',
    amount: success,
    isGreen: false,
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: 3,
    title: 'Failed Count',
    amount: failed,
    isGreen: true,
    labels: ['Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm','Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm', 'Sep 23, 8pm'],
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
];