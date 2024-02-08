export const ACTIVITY_TABLE_HEADERS = [
  {
    header: 'Reference ID',
    accessor: 'reference_id'
  },
  {
    header: 'Consumer Name',
    accessor: 'consumer_name'
  },
  // {
  //   header: 'Email Address',
  //   accessor: 'email_address'
  // },
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Status',
    accessor: 'status_code'
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

export const ACTIVITY_TABLE_CONSUMER_HEADERS = [
  {
    header: 'Reference ID',
    accessor: 'reference_id'
  },
  // {
  //   header: 'Consumer Name',
  //   accessor: 'consumer_name'
  // },
  // {
  //   header: 'Email Address',
  //   accessor: 'email_address'
  // },
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Status',
    accessor: 'status_code'
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
  { id: 0, label: 'All', value: '', name: 'all' },
  { id: 1, label: 'Continue', value: 100, name: 'continue' },
  { id: 2, label: 'Switching Protocols', value: 101, name: 'switchingProtocols' },
  { id: 3, label: 'OK', value: 200, name: 'ok' },
  { id: 4, label: 'Created', value: 201, name: 'created' },
  { id: 5, label: 'Accepted', value: 202, name: 'accepted' },
  { id: 6, label: 'Non-Authoritative Information', value: 203, name: 'nonAuthoritativeInformation' },
  { id: 7, label: 'No Content', value: 204, name: 'noContent' },
  { id: 8, label: 'Reset Content', value: 205, name: 'resetContent' },
  { id: 9, label: 'Partial Content', value: 206, name: 'partialContent' },
  { id: 10, label: 'Multiple Choices', value: 300, name: 'multipleChoices' },
  { id: 11, label: 'Moved Permanently', value: 301, name: 'movedPermanently' },
  { id: 12, label: 'Found', value: 302, name: 'found' },
  { id: 13, label: 'See Other', value: 303, name: 'seeOther' },
  { id: 14, label: 'Not Modified', value: 304, name: 'notModified' },
  { id: 15, label: 'Temporary Redirect', value: 307, name: 'temporaryRedirect' },
  { id: 16, label: 'Bad Request', value: 400, name: 'badRequest' },
  { id: 17, label: 'Unauthorized', value: 401, name: 'unauthorized' },
  { id: 18, label: 'Payment Required', value: 402, name: 'paymentRequired' },
  { id: 19, label: 'Forbidden', value: 403, name: 'forbidden' },
  { id: 20, label: 'Not Found', value: 404, name: 'notFound' },
  { id: 21, label: 'Method Not Allowed', value: 405, name: 'methodNotAllowed' },
  { id: 22, label: 'Not Acceptable', value: 406, name: 'notAcceptable' },
  { id: 23, label: 'Proxy Authentication Required', value: 407, name: 'proxyAuthenticationRequired' },
  { id: 24, label: 'Request Timeout', value: 408, name: 'requestTimeout' },
  { id: 25, label: 'Conflict', value: 409, name: 'conflict' },
  { id: 26, label: 'Gone', value: 410, name: 'gone' },
  { id: 27, label: 'Length Required', value: 411, name: 'lengthRequired' },
  { id: 28, label: 'Precondition Failed', value: 412, name: 'preconditionFailed' },
  { id: 29, label: 'Payload Too Large', value: 413, name: 'payloadTooLarge' },
  { id: 30, label: 'URI Too Long', value: 414, name: 'uriTooLong' },
  { id: 31, label: 'Unsupported Media Type', value: 415, name: 'unsupportedMediaType' },
  { id: 32, label: 'Range Not Satisfiable', value: 416, name: 'rangeNotSatisfiable' },
  { id: 33, label: 'Expectation Failed', value: 417, name: 'expectationFailed' },
  { id: 34, label: 'I\'m a Teapot', value: 418, name: 'imATeapot' },
  { id: 35, label: 'Misdirected Request', value: 421, name: 'misdirectedRequest' },
  { id: 36, label: 'Unprocessable Entity', value: 422, name: 'unprocessableEntity' },
  { id: 37, label: 'Locked', value: 423, name: 'locked' },
  { id: 38, label: 'Failed Dependency', value: 424, name: 'failedDependency' },
  { id: 39, label: 'Too Early', value: 425, name: 'tooEarly' },
  { id: 40, label: 'Upgrade Required', value: 426, name: 'upgradeRequired' },
  { id: 41, label: 'Precondition Required', value: 428, name: 'preconditionRequired' },
  { id: 42, label: 'Too Many Requests', value: 429, name: 'tooManyRequests' },
  { id: 43, label: 'Request Header Fields Too Large', value: 431, name: 'requestHeaderFieldsTooLarge' },
  { id: 44, label: 'Unavailable For Legal Reasons', value: 451, name: 'unavailableForLegalReasons' },
  { id: 45, label: 'Internal Server Error', value: 500, name: 'internalServerError' },
  { id: 46, label: 'Not Implemented', value: 501, name: 'notImplemented' },
  { id: 47, label: 'Bad Gateway', value: 502, name: 'badGateway' },
  { id: 48, label: 'Service Unavailable', value: 503, name: 'serviceUnavailable' },
  { id: 49, label: 'Gateway Timeout', value: 504, name: 'gatewayTimeout' },
  { id: 50, label: 'HTTP Version Not Supported', value: 505, name: 'httpVersionNotSupported' },
  { id: 51, label: 'Variant Also Negotiates', value: 506, name: 'variantAlsoNegotiates' },
  { id: 52, label: 'Insufficient Storage', value: 507, name: 'insufficientStorage' },
  { id: 53, label: 'Loop Detected', value: 508, name: 'loopDetected' },
  { id: 54, label: 'Not Extended', value: 510, name: 'notExtended' },
  { id: 55, label: 'Network Authentication Required', value: 511, name: 'networkAuthenticationRequired' }
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
  status_code: '200 OK',
  response_time: '1.5'
};

export const ACTIVITY_TABLE_DATA = [];

export const ACTIVITY_TABLE_FULLDATA = [
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