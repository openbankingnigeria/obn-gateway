import { MembersStatusProps } from "@/types/dataTypes"

export const MEMBERS_STATUS_DATA = ({
  all,
  invited
}: MembersStatusProps) => {
  return ([
    {
      id: 1,
      label: 'All',
      amount: all || 0,
      value: '',
      panel: true,
      name: 'all'
    },
    {
      id: 2,
      label: 'Active',
      value: 'active',
      panel: false,
      name: 'active'
    },
    {
      id: 3,
      label: 'Inactive',
      value: 'inactive',
      panel: false,
      name: 'inactive'
    },
    {
      id: 4,
      label: 'Invited',
      amount: invited || 0,
      panel: true,
      value: 'pending',
      name: 'invited'
    },
  ])
};

export const INVITED_MEMBERS_TABLE_HEADERS = [
  {
    header: 'Email Address',
    accessor: 'email_address'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  // {
  //   header: 'Invited By',
  //   accessor: 'invited_by'
  // },
  {
    header: 'Date Invited',
    accessor: 'date_invited'
  },
  {
    header: 'Role',
    accessor: 'role'
  }
];

export const MEMBERS_TABLE_HEADERS = [
  {
    header: 'Member Name',
    accessor: 'member_name'
  },
  {
    header: 'Email Address',
    accessor: 'email_address'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  {
    header: 'Role',
    accessor: 'role'
  },
  {
    header: '2FA',
    accessor: 'two_fa'
  }
];

export const MEMBERS_ACTIONS_DATA = [
  {
    id: 1,
    label: 'View',
    name: 'view',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.61342 8.4761C1.52262 8.33234 1.47723 8.26046 1.45182 8.1496C1.43273 8.06632 1.43273 7.93498 1.45182 7.85171C1.47723 7.74084 1.52262 7.66896 1.61341 7.5252C2.36369 6.33721 4.59693 3.33398 8.00027 3.33398C11.4036 3.33398 13.6369 6.33721 14.3871 7.5252C14.4779 7.66896 14.5233 7.74084 14.5487 7.85171C14.5678 7.93498 14.5678 8.06632 14.5487 8.1496C14.5233 8.26046 14.4779 8.33234 14.3871 8.4761C13.6369 9.66409 11.4036 12.6673 8.00027 12.6673C4.59693 12.6673 2.36369 9.66409 1.61342 8.4761Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent" />
      <path d="M8.00027 10.0007C9.10484 10.0007 10.0003 9.10522 10.0003 8.00065C10.0003 6.89608 9.10484 6.00065 8.00027 6.00065C6.8957 6.00065 6.00027 6.89608 6.00027 8.00065C6.00027 9.10522 6.8957 10.0007 8.00027 10.0007Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent" />
    </svg>
  },
  {
    id: 2,
    label: 'Deactivate',
    name: 'deactivate',
    type: 'active',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.66683 11.3332H11.3335C13.1744 11.3332 14.6668 9.84079 14.6668 7.99984C14.6668 6.15889 13.1744 4.6665 11.3335 4.6665H4.66683M4.66683 11.3332C2.82588 11.3332 1.3335 9.84079 1.3335 7.99984C1.3335 6.15889 2.82588 4.6665 4.66683 4.6665M4.66683 11.3332C6.50778 11.3332 8.00016 9.84079 8.00016 7.99984C8.00016 6.15889 6.50778 4.6665 4.66683 4.6665" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg> 
  },
  {
    id: 3,
    label: 'Activate',
    name: 'activate',
    type: 'inactive',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33317 10.6665H4.00016C2.5274 10.6665 1.3335 9.4726 1.3335 7.99984C1.3335 6.52708 2.5274 5.33317 4.00016 5.33317H9.33317M14.6665 7.99984C14.6665 9.84079 13.1741 11.3332 11.3332 11.3332C9.49222 11.3332 7.99984 9.84079 7.99984 7.99984C7.99984 6.15889 9.49222 4.6665 11.3332 4.6665C13.1741 4.6665 14.6665 6.15889 14.6665 7.99984Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  },
  {
    id: 4,
    label: 'Reinvite',
    name: 'reinvite',
    type: 'invited',
    icon: null
  },
];

export const MEMBERS_ROLES = [
  {
    name: 'All',
    value: ''
  },
  {
    name: 'Admin 1',
    value: 'admin_1'
  },
  {
    name: 'Admin 2',
    value: 'admin_2'
  },
  {
    name: 'API Developer',
    value: 'api_developer'
  },
  {
    name: 'API Product Manager',
    value: 'api_product_manager'
  },
  {
    name: 'Application Developer',
    value: 'application_developer'
  },
  {
    name: 'Business Analyst',
    value: 'business_analyst'
  },
  {
    name: 'Support Engineer',
    value: 'support_engineer'
  },
];

export const MEMBER_RECENT_ACTIVITIES_HEADER = [
  {
    header: 'Event Type',
    accessor: 'event_type'
  },
  {
    header: 'Description',
    accessor: 'description'
  },
  {
    header: 'Timestamp',
    accessor: 'timestamp'
  }
];

export const MEMBER_RECENT_ACTIVITIES = [];

export const MEMBER_RECENT_ACTIVITIES_FULLDATA = [
  {
    id: 1,
    event_type: 'Event title here',
    description: 'Description here',
    timestamp: '2023-09-23T12:30:54'
  },
  {
    id: 2,
    event_type: 'Event title here',
    description: 'Description here',
    timestamp: '2023-09-23T12:30:54'
  }
];

export const MEMBER_DETAILS_PANEL = [
  {
    id: 1,
    label: 'Recent Activities',
    value: '',
    name: 'recent_activities'
  },
];

export const INVITED_MEMBERS_TABLE_DATA = [];

export const INVITED_MEMBERS_TABLE_FULLDATA = [
  {
    id: 1,
    email_address: 'johnajayi@lendsqr.com',
    status: 'Invited',
    role: 'Admin 1',
    invited_by: 'Folashayo Adekunle',
    date_invited: '2023-09-25T08:15:00'
  },
  {
    id: 2,
    email_address: 'johnajayi@lendsqr.com',
    status: 'Invited',
    role: 'Admin 1',
    invited_by: 'Folashayo Adekunle',
    date_invited: '2023-09-25T08:15:00'
  },
  {
    id: 3,
    email_address: 'johnajayi@lendsqr.com',
    status: 'Invited',
    role: 'Admin 1',
    invited_by: 'Folashayo Adekunle',
    date_invited: '2023-09-25T08:15:00'
  },
  {
    id: 4,
    email_address: 'johnajayi@lendsqr.com',
    status: 'Invited',
    role: 'Admin 1',
    invited_by: 'Folashayo Adekunle',
    date_invited: '2023-09-25T08:15:00'
  },
  {
    id: 5,
    email_address: 'johnajayi@lendsqr.com',
    status: 'Invited',
    role: 'Admin 1',
    invited_by: 'Folashayo Adekunle',
    date_invited: '2023-09-25T08:15:00'
  },
];

export const MEMBERS_TABLE_DATA = [
  {
    id: 1,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: true,
  },
  {
    id: 2,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
  {
    id: 3,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: true,
  },
  {
    id: 4,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
  {
    id: 5,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
  {
    id: 6,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: true,
  },
  {
    id: 7,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
  {
    id: 8,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: true,
  },
  {
    id: 9,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
  {
    id: 10,
    member_name: 'John Ajayi',
    email_address: 'johnajayi@lendsqr.com',
    status: 'Active',
    role: 'Admin 1',
    two_fa: false,
  },
];