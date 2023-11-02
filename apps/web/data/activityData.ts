export const ACTIVITY_TABLE_HEADERS = [
  {
    header: 'Reference ID',
    accessor: 'reference_id'
  },
  {
    header: 'Consumer Name',
    accessor: 'consumer_name'
  },
  {
    header: 'Email Address',
    accessor: 'email_address'
  },
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  {
    header: 'Endpoint URL',
    accessor: 'endpoint_url'
  },
  {
    header: 'Timestamp',
    accessor: 'timestamp'
  },
  {
    header: '',
    accessor: 'actions'
  },
];

export const ACTIVITY_DETAILS_PANEL = [
  {
    id: 1,
    label: 'Request Params',
    value: '',
    name: 'request_params'
  },
  {
    id: 2,
    label: 'Response',
    value: 'response',
    name: 'response'
  },
];

export const ACTIVITY_STATUS_DATA = [
  {
    id: 1,
    label: 'All',
    value: '',
    name: 'all'
  },
  {
    id: 2,
    label: 'Success',
    value: 'success',
    name: 'success'
  },
  {
    id: 3,
    label: 'Failed',
    value: 'failed',
    name: 'failed'
  },
];

export const ACTIVITY_REQUEST_PARAMS = `{\n  "request": {\n    "headers": {\n      "Authorization": "Bearer some_access_token",\n      "Content-Type": "application/json",\n      "User-Agent": "MyApp/1.0"\n    },\n    "payload": {\n      "user_id": "12345",\n      "action": "getBalance",\n      "account_type": "savings"\n    },\n}`;

export const ACTIVITY_REQUEST_PARAMS_DATA = {
  authorization: 'Bearer some_access_token',
  content_type: 'application/json',
  user_agent: 'MyApp/1.0',
  user_id: '12345',
  action: 'getBalance',
  account_type: 'savings'
};

export const ACTIVITY_RESPONSE = `{\n  "response": {\n    "headers": {\n      "Content-Type": "application/json",\n      "Date": "Wed, 16 Oct 2023 12:34:56 GMT"\n    },\n    "payload": {\n      "balance": "1000",\n      "currency": "USD"\n    },\n}`;

export const ACTIVITY_RESPONSE_DATA = {
  content_type: 'application/json',
  date: 'Wed, 16 Oct 2023 12:34:56 GMT',
  balance: '1000',
  currency: 'USD'
};

export const ACTIVITY_DETAILS = {
  id: 1,
  reference_id: 'API-A1B2C3D4E5F6',
  consumer_name: 'John Ajayi',
  email_address: 'johnajayi@lendsqr.com',
  api_name: 'Get Transactions',
  status: 'success',
  endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
  timestamp: '2023-09-23T12:30:54',
  status_code: '200 OK'
};

export const ACTIVITY_TABLE_DATA = [
  {
    id: 1,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Get Transactions',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 2,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Get Transactions',
    status: 'failed',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 3,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Release Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 4,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Release Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 5,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Transfer Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 6,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Transfer Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 7,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Release Funds',
    status: 'failed',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 8,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Get Transactions',
    status: 'failed',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 9,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Transfer Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 10,
    reference_id: 'API-A1B2C3D4E5F6',
    consumer_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    api_name: 'Transfer Funds',
    status: 'success',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    timestamp: '2023-09-23T12:30:54'
  },
];