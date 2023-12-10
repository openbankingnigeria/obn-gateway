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

export const CONSENT_ACTIONS_DATA = [
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
    label: 'Revoke',
    name: 'revoke',
    type: 'approved',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M6 6L10 10M10 6L6 10M5.2 14H10.8C11.9201 14 12.4802 14 12.908 13.782C13.2843 13.5903 13.5903 13.2843 13.782 12.908C14 12.4802 14 11.9201 14 10.8V5.2C14 4.0799 14 3.51984 13.782 3.09202C13.5903 2.71569 13.2843 2.40973 12.908 2.21799C12.4802 2 11.9201 2 10.8 2H5.2C4.0799 2 3.51984 2 3.09202 2.21799C2.71569 2.40973 2.40973 2.71569 2.21799 3.09202C2 3.51984 2 4.0799 2 5.2V10.8C2 11.9201 2 12.4802 2.21799 12.908C2.40973 13.2843 2.71569 13.5903 3.09202 13.782C3.51984 14 4.0799 14 5.2 14Z" 
        stroke="#344054" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="transparent"
      />
    </svg>    
  },
  {
    id: 2,
    label: 'Resend',
    name: 'resend',
    type: 'pending',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_886_5495)">
        <path 
          d="M6.99969 9.00012L13.9997 2.00012M7.08474 9.21883L8.83682 13.7242C8.99116 14.1211 9.06834 14.3195 9.17954 14.3774C9.27594 14.4277 9.39077 14.4277 9.48723 14.3776C9.5985 14.3198 9.67591 14.1215 9.83073 13.7247L14.2243 2.46625C14.364 2.10813 14.4339 1.92907 14.3957 1.81465C14.3625 1.71528 14.2845 1.6373 14.1852 1.60411C14.0707 1.56588 13.8917 1.63576 13.5336 1.77552L2.27506 6.16908C1.87834 6.32389 1.67998 6.4013 1.62218 6.51257C1.57206 6.60903 1.57213 6.72386 1.62236 6.82026C1.68029 6.93146 1.87874 7.00864 2.27564 7.16299L6.78098 8.91506C6.86154 8.94639 6.90182 8.96206 6.93575 8.98625C6.96581 9.0077 6.9921 9.03399 7.01355 9.06406C7.03774 9.09798 7.05341 9.13826 7.08474 9.21883Z" 
          stroke="#344054" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          fill="transparent"
        />
      </g>
      <defs>
        <clipPath id="clip0_886_5495">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>       
  },
];

export const CONSENTS_API_ACTIVITIES = [];

export const CONSENTS_API_ACTIVITIES_FULLDATA = [
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

export const CONSENTS_TABLE_DATA = [];

export const CONSENTS_TABLE_FULLDATA = [
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