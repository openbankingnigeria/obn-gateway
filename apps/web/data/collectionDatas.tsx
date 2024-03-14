export const COLLECTIONS_TABLE_HEADERS = [
  {
    header: 'Collection Name',
    accessor: 'collection_name'
  },
  {
    header: 'Description',
    accessor: 'description'
  },
  // {
  //   header: 'No of APIs',
  //   accessor: 'no_of_apis'
  // },
  // {
  //   header: 'Active APIs',
  //   accessor: 'configuration'
  // }
];

export const API_CONFIGURATION_PANEL = [
  {
    id: 1,
    label: 'Request Body',
    value: 'request_body'
  },
  {
    id: 2,
    label: 'Response Body',
    value: 'response_body'
  },
  {
    id: 3,
    label: 'Request Header',
    value: 'request_header'
  },
  {
    id: 4,
    label: 'Response Header',
    value: 'response_header'
  }
];

export const DASHBOARD_API_HEADERS = [
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Method',
    accessor: 'request_method'
  },
  {
    header: 'Endpoint URL',
    accessor: 'endpoint_url'
  },
  {
    header: 'Tier',
    accessor: 'tier'
  },
];

export const COLLECTIONS_API_CONSUMER_HEADERS = [
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Method',
    accessor: 'request_method'
  },
  {
    header: 'Endpoint URL',
    accessor: 'endpoint_url'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
];

export const COLLECTIONS_API_HEADERS = [
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Method',
    accessor: 'request_method'
  },
  {
    header: 'Endpoint URL',
    accessor: 'endpoint_url'
  },
  // {
  //   header: 'Tier',
  //   accessor: 'tier'
  // },
  {
    // header: 'Paths',
    header: 'Tiers',
    accessor: 'parameters'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
];

export const COLLECTION_ACTIONS_CONSUMER_DATA = [
  {
    id: 1,
    label: 'Preview',
    name: 'preview',
    permit: 'view-api-endpoint, view-assigned-api-endpoints',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.61342 8.47513C1.52262 8.33137 1.47723 8.25949 1.45182 8.14862C1.43273 8.06534 1.43273 7.93401 1.45182 7.85073C1.47723 7.73986 1.52262 7.66798 1.61341 7.52422C2.36369 6.33624 4.59693 3.33301 8.00027 3.33301C11.4036 3.33301 13.6369 6.33623 14.3871 7.52422C14.4779 7.66798 14.5233 7.73986 14.5487 7.85073C14.5678 7.93401 14.5678 8.06534 14.5487 8.14862C14.5233 8.25949 14.4779 8.33137 14.3871 8.47513C13.6369 9.66311 11.4036 12.6663 8.00027 12.6663C4.59693 12.6663 2.36369 9.66311 1.61342 8.47513Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
      <path d="M8.00027 9.99967C9.10484 9.99967 10.0003 9.10424 10.0003 7.99967C10.0003 6.89511 9.10484 5.99967 8.00027 5.99967C6.8957 5.99967 6.00027 6.89511 6.00027 7.99967C6.00027 9.10424 6.8957 9.99967 8.00027 9.99967Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
    </svg>
  },
];

export const COLLECTION_ACTIONS_DATA = [
  {
    id: 1,
    label: 'Preview',
    name: 'preview',
    permit: 'view-api-endpoint',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.61342 8.47513C1.52262 8.33137 1.47723 8.25949 1.45182 8.14862C1.43273 8.06534 1.43273 7.93401 1.45182 7.85073C1.47723 7.73986 1.52262 7.66798 1.61341 7.52422C2.36369 6.33624 4.59693 3.33301 8.00027 3.33301C11.4036 3.33301 13.6369 6.33623 14.3871 7.52422C14.4779 7.66798 14.5233 7.73986 14.5487 7.85073C14.5678 7.93401 14.5678 8.06534 14.5487 8.14862C14.5233 8.25949 14.4779 8.33137 14.3871 8.47513C13.6369 9.66311 11.4036 12.6663 8.00027 12.6663C4.59693 12.6663 2.36369 9.66311 1.61342 8.47513Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
      <path d="M8.00027 9.99967C9.10484 9.99967 10.0003 9.10424 10.0003 7.99967C10.0003 6.89511 9.10484 5.99967 8.00027 5.99967C6.8957 5.99967 6.00027 6.89511 6.00027 7.99967C6.00027 9.10424 6.8957 9.99967 8.00027 9.99967Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
    </svg>
  },
  {
    id: 2,
    label: 'Configure',
    name: 'configure',
    permit: 'update-api-endpoint',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 5.33301L10 5.33301M10 5.33301C10 6.43758 10.8954 7.33301 12 7.33301C13.1046 7.33301 14 6.43758 14 5.33301C14 4.22844 13.1046 3.33301 12 3.33301C10.8954 3.33301 10 4.22844 10 5.33301ZM6 10.6663L14 10.6663M6 10.6663C6 11.7709 5.10457 12.6663 4 12.6663C2.89543 12.6663 2 11.7709 2 10.6663C2 9.56177 2.89543 8.66634 4 8.66634C5.10457 8.66634 6 9.56177 6 10.6663Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
    </svg>    
  },
  {
    id: 3,
    label: 'Publish to Production',
    name: 'publish',
    permit: '',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33317 10.6665H4.00016C2.5274 10.6665 1.3335 9.4726 1.3335 7.99984C1.3335 6.52708 2.5274 5.33317 4.00016 5.33317H9.33317M14.6665 7.99984C14.6665 9.84079 13.1741 11.3332 11.3332 11.3332C9.49222 11.3332 7.99984 9.84079 7.99984 7.99984C7.99984 6.15889 9.49222 4.6665 11.3332 4.6665C13.1741 4.6665 14.6665 6.15889 14.6665 7.99984Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  // {
  //   id: 3,
  //   label: 'Modify',
  //   name: 'modify',
  //   type: 'all',
  //   icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
  //     <g clipPath="url(#clip0_1033_4975)">
  //       <path d="M1.91744 12.0766C1.94807 11.801 1.96339 11.6632 2.00509 11.5343C2.04209 11.42 2.09437 11.3113 2.16051 11.211C2.23505 11.0979 2.33311 10.9999 2.52923 10.8037L11.3334 1.99955C12.0698 1.26317 13.2637 1.26317 14.0001 1.99955C14.7365 2.73593 14.7365 3.92984 14.0001 4.66622L5.1959 13.4704C4.99978 13.6665 4.90172 13.7646 4.78867 13.8391C4.68838 13.9053 4.57961 13.9575 4.46531 13.9945C4.33648 14.0362 4.19865 14.0516 3.92299 14.0822L1.66675 14.3329L1.91744 12.0766Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent"/>
  //     </g>
  //     <defs>
  //       <clipPath id="clip0_1033_4975">
  //         <rect width="16" height="16" fill="white"/>
  //       </clipPath>
  //     </defs>
  //   </svg>    
  // },
  {
    id: 4,
    label: 'Deactivate',
    name: 'deactivate',
    permit: 'update-api-endpoint',
    type: 'enabled',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.66683 11.3332H11.3335C13.1744 11.3332 14.6668 9.84079 14.6668 7.99984C14.6668 6.15889 13.1744 4.6665 11.3335 4.6665H4.66683M4.66683 11.3332C2.82588 11.3332 1.3335 9.84079 1.3335 7.99984C1.3335 6.15889 2.82588 4.6665 4.66683 4.6665M4.66683 11.3332C6.50778 11.3332 8.00016 9.84079 8.00016 7.99984C8.00016 6.15889 6.50778 4.6665 4.66683 4.6665" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg> 
  },
  {
    id: 5,
    label: 'Activate',
    name: 'activate',
    permit: 'update-api-endpoint',
    type: 'disabled',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33317 10.6665H4.00016C2.5274 10.6665 1.3335 9.4726 1.3335 7.99984C1.3335 6.52708 2.5274 5.33317 4.00016 5.33317H9.33317M14.6665 7.99984C14.6665 9.84079 13.1741 11.3332 11.3332 11.3332C9.49222 11.3332 7.99984 9.84079 7.99984 7.99984C7.99984 6.15889 9.49222 4.6665 11.3332 4.6665C13.1741 4.6665 14.6665 6.15889 14.6665 7.99984Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 6,
    label: 'Delete',
    name: 'delete',
    permit: 'delete-api-endpoint',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L10 10M10 6L6 10M5.2 14H10.8C11.9201 14 12.4802 14 12.908 13.782C13.2843 13.5903 13.5903 13.2843 13.782 12.908C14 12.4802 14 11.9201 14 10.8V5.2C14 4.0799 14 3.51984 13.782 3.09202C13.5903 2.71569 13.2843 2.40973 12.908 2.21799C12.4802 2 11.9201 2 10.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.0799 2 5.2V10.8C2 11.9201 2 12.4802 2.21799 12.908C2.40973 13.2843 2.71569 13.5903 3.09202 13.782C3.51984 14 4.0799 14 5.2 14Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>    
  }
];

export const COLLECTIONS_REQUEST_METHOD = [
  {
    id: 0,
    label: 'All',
    name: 'all',
    value: ''
  },
  {
    id: 1,
    label: 'GET',
    name: 'get',
    value: 'get'
  },
  {
    id: 2,
    label: 'POST',
    name: 'post',
    value: 'post'
  },
  {
    id: 3,
    label: 'PUT',
    name: 'put',
    value: 'put'
  },
  {
    id: 4,
    label: 'DELETE',
    name: 'delete',
    value: 'delete'
  }
];

export const COLLECTIONS_TIER = [
  {
    id: 0,
    label: 'All',
    name: 'all',
    value: ''
  },
  {
    id: 1,
    label: 'T1',
    name: 'T1',
    value: 'T1'
  },
  {
    id: 2,
    label: 'T2',
    name: 'T2',
    value: 'T2'
  },
  {
    id: 3,
    label: 'T3',
    name: 'T3',
    value: 'T3'
  },
  {
    id: 4,
    label: 'T4',
    name: 'T4',
    value: 'T4'
  }
];

export const COLLECTIONS_APIS = [];

export const COLLECTIONS_APIS_FULLDATA = [
  {
    id: 1,
    api_name: 'Get Transactions',
    request_method: 'GET',
    configured: true,
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    tier: 'T1',
    parameters: 'name, user_id, email'
  },
  {
    id: 2,
    api_name: 'Transfer Funds',
    request_method: 'POST',
    configured: false,
    endpoint_url: '-',
    tier: 'T2',
    parameters: '-'
  },
  {
    id: 3,
    api_name: 'Get Transaction Staus',
    request_method: 'PUT',
    configured: true,
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    tier: 'T1',
    parameters: ''
  },
  {
    id: 4,
    api_name: 'Get Holds',
    request_method: 'GET',
    configured: false,
    endpoint_url: '-',
    tier: 'T3',
    parameters: '-'
  },
  {
    id: 5,
    api_name: 'Hold Funds',
    request_method: 'GET',
    configured: true,
    endpoint_url: '{{base_url}}/accounts/:account_id/holds',
    tier: 'T1',
    parameters: ''
  },
  {
    id: 6,
    api_name: 'Release Funds',
    request_method: 'DELETE',
    configured: true,
    endpoint_url: '{{base_url}}/accounts/:account_id/holds/:hold_referernce',
    tier: 'T1',
    parameters: 'name, user_id, email'
  }
];

export const COLLECTIONS_TABLE_DATA = [];

export const COLLECTIONS_TABLE_FULLDATA = [
  {
    id: 1,
    collection_name: 'Authorization',
    description: 'Authorization in Open banking could be perform using smart channel, for customers with access to smart devices.',
    no_of_apis: '9',
    configuration: '9'
  },
  {
    id: 2,
    collection_name: 'Meta',
    description: 'These endpoints provide information about functions and services that are available from an API Provider. These would be available to API Consumers to make programmatic decisions which of the services can be made available to End Users.',
    no_of_apis: '7',
    configuration: '7'
  },
  {
    id: 3,
    collection_name: 'Customer',
    description: 'The endpoints are used to create a customer at the bank. The customer\'s detail supplied belongs exclusive to the bank where it is being created. The section also provides api that could be used to manage a customer.',
    no_of_apis: '7',
    configuration: '7'
  },
  {
    id: 4,
    collection_name: 'Accounts',
    description: 'These endpoints are used for managing a customer\'s account with an API provider which is licensed by the CBN',
    no_of_apis: '5',
    configuration: '2'
  },
  {
    id: 5,
    collection_name: 'Transactions',
    description: 'These endpoints are used to get transaction data, mostly known as account statement, for customers who have authorized their accounts to be accessed by the AC. The endpoints also support transactions such as transfer to accounts within the same bank or to other banks. Transfers within the API Provider or to other FIs are handled by whatever internal mechanism being used by the API Provider and cannot be specified by the AC.',
    no_of_apis: '6',
    configuration: '6'
  },
  {
    id: 6,
    collection_name: 'KYC',
    description: 'These APIs are used to get more information about a customer.',
    no_of_apis: '2',
    configuration: '0'
  },
  {
    id: 7,
    collection_name: 'Virtual Accounts',
    description: 'Virtual Accounts help merchants or service providers to create accounts on the fly to receive payments, which are then instantly mapped to their collection accounts and reconciled to their customers. Virtual Accounts can be mapped to a Customer on a service providers platform or to a particular order.',
    no_of_apis: '5',
    configuration: '5'
  },
  {
    id: 8,
    collection_name: 'Frauds',
    description: 'This endpoint is used to report fraud incidences directly to the bank or financial institution. It may sometimes be difficult to get account holders authenticated therefore identifying information are not mandatory. However, banks may not process these requests online real time and its for informational purposes only',
    no_of_apis: '2',
    configuration: '2'
  },
  {
    id: 9,
    collection_name: 'Bills Payment',
    description: 'The bills payment APIs enable the customers of a bank or other service providers to make payments to billers through their platform. This provides the financial institution with the capability to offer their customers access to the vast array of billers and merchants such as a public utility, department store, or an individual to be credited against a specific account.',
    no_of_apis: '5',
    configuration: '5'
  },
  {
    id: 10,
    collection_name: 'Direct Debit',
    description: 'Direct debit is a service that allows Merchants and Billers to pull money from a customer’s account for a service rendered to the Customer. These endpoints are used to create, modify, apply, and list mandates or tokenized persistent authorizations against a customer\'s account. A direct debit mandate must first be set up on a customer account before scheduled, or Ad-hoc transactions can happen without further active/in-band authorization by the customer. At the time the mandate is set up, customers can determine the maximum amount a mandate can allow, how long the mandate should be in force, and if the amount should be fixed or varied.',
    no_of_apis: '4',
    configuration: '2'
  }
];