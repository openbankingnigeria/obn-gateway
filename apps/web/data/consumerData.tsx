import { ConsumerStatusDataProps } from "@/types/dataTypes";

export const CONSUMERS_STATUS_DATA = ({
  all, 
  pending, 
  active, 
  inactive, 
  rejected,
}: ConsumerStatusDataProps) => {
  return ([
    {
      id: 1,
      label: 'All Consumers',
      amount: all || 0,
      value: '',
      name: 'all'
    },
    {
      id: 2,
      label: 'Pending',
      amount: pending || 0,
      value: 'pending',
      name: 'pending'
    },
    {
      id: 3,
      label: 'Active',
      amount: active || 0,
      value: 'active',
      name: 'active'
    },
    {
      id: 4,
      label: 'Inactive',
      amount: inactive || 0,
      value: 'inactive',
      name: 'inactive'
    },
    {
      id: 5,
      label: 'Rejected',
      amount: rejected || 0,
      value: 'rejected',
      name: 'rejected'
    },
  ]);
}

export const CONSUMER_ACTIONS_DATA = [
  {
    id: 1,
    label: 'View',
    name: 'view',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.61342 8.47562C1.52262 8.33186 1.47723 8.25998 1.45182 8.14911C1.43273 8.06583 1.43273 7.9345 1.45182 7.85122C1.47723 7.74035 1.52262 7.66847 1.61341 7.52471C2.36369 6.33672 4.59693 3.3335 8.00027 3.3335C11.4036 3.3335 13.6369 6.33672 14.3871 7.52471C14.4779 7.66847 14.5233 7.74035 14.5487 7.85122C14.5678 7.9345 14.5678 8.06583 14.5487 8.14911C14.5233 8.25998 14.4779 8.33186 14.3871 8.47562C13.6369 9.6636 11.4036 12.6668 8.00027 12.6668C4.59693 12.6668 2.36369 9.6636 1.61342 8.47562Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.00027 10.0002C9.10484 10.0002 10.0003 9.10473 10.0003 8.00016C10.0003 6.89559 9.10484 6.00016 8.00027 6.00016C6.8957 6.00016 6.00027 6.89559 6.00027 8.00016C6.00027 9.10473 6.8957 10.0002 8.00027 10.0002Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  },
  {
    id: 2,
    label: 'Approve',
    name: 'approve',
    type: 'pending',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_705_20563)">
        <path d="M14.6666 7.39065V8.00398C14.6658 9.44159 14.2003 10.8404 13.3395 11.9919C12.4787 13.1433 11.2688 13.9856 9.89016 14.3932C8.51154 14.8009 7.03809 14.7519 5.68957 14.2537C4.34104 13.7555 3.18969 12.8347 2.40723 11.6287C1.62476 10.4227 1.25311 8.99602 1.3477 7.56152C1.44229 6.12702 1.99806 4.76153 2.93211 3.66869C3.86615 2.57586 5.12844 1.81423 6.53071 1.49741C7.93298 1.18059 9.4001 1.32554 10.7133 1.91065M14.6666 2.66683L7.99992 9.34016L5.99992 7.34016" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_705_20563">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    
  },
  {
    id: 3,
    label: 'Decline',
    name: 'decline',
    type: 'pending',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_705_4774)">
        <path d="M9.99992 6.00016L5.99992 10.0002M5.99992 6.00016L9.99992 10.0002M14.6666 8.00016C14.6666 11.6821 11.6818 14.6668 7.99992 14.6668C4.31802 14.6668 1.33325 11.6821 1.33325 8.00016C1.33325 4.31826 4.31802 1.3335 7.99992 1.3335C11.6818 1.3335 14.6666 4.31826 14.6666 8.00016Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      <defs>
        <clipPath id="clip0_705_4774">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  },
  {
    id: 4,
    label: 'Deactivate',
    name: 'deactivate',
    type: 'active',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.66683 11.3332H11.3335C13.1744 11.3332 14.6668 9.84079 14.6668 7.99984C14.6668 6.15889 13.1744 4.6665 11.3335 4.6665H4.66683M4.66683 11.3332C2.82588 11.3332 1.3335 9.84079 1.3335 7.99984C1.3335 6.15889 2.82588 4.6665 4.66683 4.6665M4.66683 11.3332C6.50778 11.3332 8.00016 9.84079 8.00016 7.99984C8.00016 6.15889 6.50778 4.6665 4.66683 4.6665" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg> 
  },
  {
    id: 5,
    label: 'Activate',
    name: 'activate',
    type: 'inactive',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33317 10.6665H4.00016C2.5274 10.6665 1.3335 9.4726 1.3335 7.99984C1.3335 6.52708 2.5274 5.33317 4.00016 5.33317H9.33317M14.6665 7.99984C14.6665 9.84079 13.1741 11.3332 11.3332 11.3332C9.49222 11.3332 7.99984 9.84079 7.99984 7.99984C7.99984 6.15889 9.49222 4.6665 11.3332 4.6665C13.1741 4.6665 14.6665 6.15889 14.6665 7.99984Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  }
];

export const CONSUMER_DETAILS_PANEL = [
  {
    id: 1,
    label: 'API Activities',
    value: '',
    name: 'api_activities'
  },
  {
    id: 2,
    label: 'Consents',
    value: 'consents',
    name: 'consents'
  },
];

export const CONSUMERS_TABLE_HEADERS = [
  {
    header: 'Company Name',
    accessor: 'company_name'
  },
  {
    header: 'Name',
    accessor: 'name'
  },
  {
    header: 'Email Address',
    accessor: 'email_address'
  },
  {
    header: 'Status',
    accessor: 'status'
  }
];

export const CONSUMER_API_ACTIVITIES_HEADERS = [
  {
    header: 'API Name',
    accessor: 'api_name'
  },
  {
    header: 'Endpoint URL',
    accessor: 'endpoint_url'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  {
    header: 'Timestamp',
    accessor: 'timestamp'
  },
];

export const CONSUMER_API_ACTIVITIES = [
  {
    id: 1,
    api_name: 'Get Transactions',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    status: 'success',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 2,
    api_name: 'Get Transactions',
    endpoint_url: '{{base_url}}/accounts/:account_id/transactions',
    status: 'failed',
    timestamp: '2023-09-23T12:30:54'
  },
];

export const CONSUMER_API_ACTIVITIES_STATUS = [
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

export const CONSUMER_CONSENTS_HEADERS = [
  {
    header: 'Name',
    accessor: 'name'
  },
  {
    header: 'Email',
    accessor: 'email'
  },
  {
    header: 'Date Sent',
    accessor: 'date_sent'
  },
  {
    header: 'Status',
    accessor: 'status'
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
    header: 'Timeline',
    accessor: 'timeline'
  },
];

export const CONSUMER_CONSENTS = [
  {
    id: 1,
    name: 'Consent name',
    email: 'bob.julian@lendsqr.com',
    date_sent: '2023-09-25',
    status: 'Active',
    velocity: '20s',
    amount: '10',
    timeline: '2023-09-23T12:30:54'
  },
  {
    id: 2,
    name: 'Consent name',
    email: 'bob.julian@lendsqr.com',
    date_sent: '2023-09-25',
    status: 'Inactive',
    velocity: '10s',
    amount: '2',
    timeline: '2023-09-23T12:30:54'
  },
];

export const CONSUMER_CONSENTS_STATUS = [
  {
    id: 1,
    label: 'All',
    value: '',
    name: 'all'
  },
  {
    id: 2,
    label: 'Active',
    value: 'active',
    name: 'active'
  },
  {
    id: 3,
    label: 'Inactive',
    value: 'inactive',
    name: 'inactive'
  },
];

export const CONSUMERS_TABLE_DATA = [
  {
    id: 1,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
  {
    id: 2,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'PENDING',
  },
  {
    id: 3,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
  {
    id: 4,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'INACTIVE',
  },
  {
    id: 5,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
  {
    id: 6,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
  {
    id: 7,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'REJECTED',
  },
  {
    id: 8,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
  {
    id: 9,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'REJECTED',
  },
  {
    id: 10,
    name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    company_name: 'Lendsqr',
    status: 'ACTIVE',
  },
];