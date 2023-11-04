import { ConsentsStatusDataProps } from "@/types/dataTypes";

export const CONSENTS_STATUS_DATA = ({
  all, 
  approved, 
  pending, 
  revoked, 
  declined,
}: ConsentsStatusDataProps) => {
  return ([
    {
      id: 1,
      label: 'All Consents',
      amount: all || 0,
      value: '',
      name: 'all'
    },
    {
      id: 2,
      label: 'Approved',
      amount: approved || 0,
      value: 'approved',
      name: 'approved'
    },
    {
      id: 3,
      label: 'Pending',
      amount: pending || 0,
      value: 'pending',
      name: 'pending'
    },
    {
      id: 4,
      label: 'Revoked',
      amount: revoked || 0,
      value: 'revoked',
      name: 'revoked'
    },
    {
      id: 5,
      label: 'Declined',
      amount: declined || 0,
      value: 'declined',
      name: 'declined'
    },
  ]);
}

export const CONSENTS_API_ACTIVITIES = [
  {
    id: 1,
    event_type: 'Get Transactions',
    request_method: 'GET',
    usage_frequency: '20',
    timestamp: '2023-09-25T08:15:00'
  },
  {
    id: 2,
    event_type: 'Transfer Funds',
    request_method: 'POST',
    usage_frequency: '28',
    timestamp: '2023-09-25T08:15:00'
  },
  {
    id: 3,
    event_type: 'Transfer Funds',
    request_method: 'PUT',
    usage_frequency: '10',
    timestamp: '2023-09-25T08:15:00'
  }
];

export const CONSENTS_API_ACTIVITIES_STATUS = [
  {
    id: 1,
    label: 'All',
    value: '',
    name: 'all'
  },
];

export const CONSENTS_API_ACTIVITIES_HEADERS = [
  {
    header: 'Event Type',
    accessor: 'event_type'
  },
  {
    header: 'Request Method',
    accessor: 'request_method'
  },
  {
    header: 'Usage Frequency',
    accessor: 'usage_frequency'
  },
  {
    header: 'Timestamp',
    accessor: 'timestamp'
  },
];

export const CONSENTS_TABLE_HEADERS = [
  {
    header: 'Consent ID',
    accessor: 'consent_id'
  },
  {
    header: 'Consumer Name',
    accessor: 'consumer_name'
  },
  {
    header: 'Customer Name',
    accessor: 'customer_name'
  },
  {
    header: 'Email',
    accessor: 'email'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  {
    header: 'Date Sent',
    accessor: 'date_sent'
  },
  {
    header: 'Velocity',
    accessor: 'velocity'
  },
  {
    header: 'Amount',
    accessor: 'amount'
  },
  {
    header: 'Valid From',
    accessor: 'valid_from'
  },
  {
    header: 'Valid Until',
    accessor: 'valid_until'
  }
];

export const CONSENTS_TABLE_DATA = [
  {
    id: 1,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 2,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 3,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'PENDING',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 4,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 5,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 6,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'DECLINED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 7,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'REVOKED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 8,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 9,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
  {
    id: 10,
    consent_id: '#128902983GH',
    consumer_name: 'John Ajayi',
    customer_name: 'Folashayo Adekunle',
    email: 'johnajayi@lendsqr.com',
    status: 'APPROVED',
    date_sent: '2023-09-25T08:15:00',
    velocity: '20s',
    amount: '10',
    valid_from: '2023-09-25',
    valid_until: '2023-09-25',
  },
];