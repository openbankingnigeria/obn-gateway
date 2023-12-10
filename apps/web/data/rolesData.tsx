export const ROLES_TABLE_HEADERS = [
  {
    header: 'Role Name',
    accessor: 'role_name'
  },
  {
    header: 'Description',
    accessor: 'description'
  },
  {
    header: 'Status',
    accessor: 'status'
  },
  {
    header: 'Date Created',
    accessor: 'date_created'
  },
  // {
  //   header: 'Members',
  //   accessor: 'members'
  // }
];

export const ROLES_ACTIONS_DATA = [
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
    label: 'Edit',
    name: 'edit',
    type: 'all',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1135_20837)">
        <path d="M1.91732 12.0766C1.94795 11.801 1.96326 11.6632 2.00497 11.5343C2.04197 11.42 2.09425 11.3113 2.16038 11.211C2.23493 11.0979 2.33299 10.9999 2.52911 10.8037L11.3333 1.99955C12.0697 1.26317 13.2636 1.26317 14 1.99955C14.7364 2.73593 14.7364 3.92984 14 4.66622L5.19578 13.4704C4.99966 13.6665 4.9016 13.7646 4.78855 13.8391C4.68826 13.9053 4.57949 13.9575 4.46519 13.9945C4.33636 14.0362 4.19853 14.0516 3.92287 14.0822L1.66663 14.3329L1.91732 12.0766Z" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="transparent" />
      </g>
      <defs>
        <clipPath id="clip0_1135_20837">
          <rect width="16" height="16" fill="white"/>
        </clipPath>
      </defs>
    </svg>
    
  },
  {
    id: 3,
    label: 'Deactivate',
    name: 'deactivate',
    type: 'active',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.66683 11.3332H11.3335C13.1744 11.3332 14.6668 9.84079 14.6668 7.99984C14.6668 6.15889 13.1744 4.6665 11.3335 4.6665H4.66683M4.66683 11.3332C2.82588 11.3332 1.3335 9.84079 1.3335 7.99984C1.3335 6.15889 2.82588 4.6665 4.66683 4.6665M4.66683 11.3332C6.50778 11.3332 8.00016 9.84079 8.00016 7.99984C8.00016 6.15889 6.50778 4.6665 4.66683 4.6665" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg> 
  },
  {
    id: 4,
    label: 'Activate',
    name: 'activate',
    type: 'inactive',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33317 10.6665H4.00016C2.5274 10.6665 1.3335 9.4726 1.3335 7.99984C1.3335 6.52708 2.5274 5.33317 4.00016 5.33317H9.33317M14.6665 7.99984C14.6665 9.84079 13.1741 11.3332 11.3332 11.3332C9.49222 11.3332 7.99984 9.84079 7.99984 7.99984C7.99984 6.15889 9.49222 4.6665 11.3332 4.6665C13.1741 4.6665 14.6665 6.15889 14.6665 7.99984Z" fill="transparent" stroke="#344054" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  }
];

export const ROLES_STATUS_DATA = [
  {
    id: 0,
    label: 'All',
    value: '',
    name: 'all'
  },
  {
    id: 1,
    label: 'Active',
    value: 'active',
    name: 'active'
  },
  {
    id: 2,
    label: 'Inactive',
    value: 'inactive',
    name: 'inactive'
  },
];

export const ROLES_2FA_DATA = [
  {
    id: 1,
    label: 'All',
    value: '',
    name: 'all'
  },
];

export const ROLES_MEMBERS = [];

export const ROLES_MEMBERS_FULLDATA = [
  {
    id: 1,
    name: 'John Ajayi',
    email: 'johnajaiy@lendsqr.com'
  },
  {
    id: 2,
    name: 'John Ajayi',
    email: 'johnajaiy@lendsqr.com'
  },
  {
    id: 3,
    name: 'John Ajayi',
    email: 'johnajaiy@lendsqr.com'
  },
];

export const ROLES_VIEW_PERMISSIONS = [
  {
    id: 1,
    label: 'Manage API Consumers: Create, Edit and Delete'
  },
  {
    id: 2,
    label: 'Manage API Collections: Create, Edit and Delete'
  },
  {
    id: 3,
    label: 'User Management: Invite, Deactivate, Activate and Assign roles'
  },
  {
    id: 4,
    label: 'Reports: Generate and Download'
  },
  {
    id: 5,
    label: 'Manage Members: Invite, Deactivate, Activate, Delete and Edit'
  },
  {
    id: 6,
    label: 'Manage Roles: Create, Edit and Delete'
  },
];
export const ROLES_TABLE_DATA = [];

export const ROLES_TABLE_FULLDATA = [
  {
    id: 1,
    role_name: 'Admin 1',
    description: 'Administrators have full control over the API management platform.',
    status: 'Active',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
  {
    id: 2,
    role_name: 'Admin 2',
    description: 'Administrators have full control over the API management platform.',
    status: 'Active',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
  {
    id: 3,
    role_name: 'API Developer',
    description: 'API Developers are responsible for creating and maintaining the APIs.',
    status: 'Active',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
  {
    id: 4,
    role_name: 'API Product Manager',
    description: 'API Product Managers focus on the business aspects of the APIs. They may have the capability to bundle multiple APIs into API products, set rate plans, and analyze API usage to understand client behavior.',
    status: 'Inactive',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
  {
    id: 5,
    role_name: 'Application Developer',
    description: 'Operations Engineers monitor the health of the API Gateway and ensure that the services are available and performant.',
    status: 'Active',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
  {
    id: 6,
    role_name: 'Support Engineer',
    description: 'Support Engineers troubleshoot issues reported by API consumers.',
    status: 'Active',
    date_created: '2023-09-25T08:15:00',
    members: 10
  },
];

export const EDIT_ROLE_DETAILS = {
  role_name: 'Admin',
  description: 'Administrators have full control over the API management platform.',
  members: ROLES_MEMBERS,
  permissions: [
    {
      permission: 'manage_api_consumers',
      options: [
        {
          label: 'Create',
          value: 'create'
        },
        {
          label: 'Edit',
          value: 'edit'
        },
        {
          label: 'Delete',
          value: 'delete'
        },
      ]
    },
    {
      permission: 'manage_api_collections',
      options: [
        {
          label: 'Create',
          value: 'create'
        },
        {
          label: 'Edit',
          value: 'edit'
        },
        {
          label: 'Delete',
          value: 'delete'
        },
      ]
    },
    {
      permission: 'api_activity',
      options: [
        {
          label: 'View',
          value: 'view'
        }
      ]
    },
    {
      permission: 'permission',
      options: [
        {
          label: 'Generate',
          value: 'generate'
        },
        {
          label: 'Download',
          value: 'download'
        },
      ]
    },
    {
      permission: 'consents',
      options: [
        {
          label: 'Edit',
          value: 'edit'
        },
      ]
    },
    {
      permission: 'manage_members',
      options: [
        {
          label: 'Invite',
          value: 'invite'
        },
        {
          label: 'Manage Access',
          value: 'manage_access'
        },
        {
          label: 'Delete',
          value: 'delete'
        }
      ]
    },
    {
      permission: 'manage_roles',
      options: [
        {
          label: 'Edit',
          value: 'edit'
        },
      ]
    }
  ]
}

export const ROLES_PERMISSIONS = [
  {
    id: 1,
    label: 'Manage API Consumers',
    value: 'manage_api_consumers',
    permission_options: [
      {
        id: 1,
        label: 'Create',
        value: 'create'
      },
      {
        id: 1,
        label: 'Edit',
        value: 'edit'
      },
      {
        id: 1,
        label: 'Delete',
        value: 'delete'
      },
      {
        id: 1,
        label: 'Update',
        value: 'update'
      },
    ]
  },
  {
    id: 2,
    label: 'Manage API Collections',
    value: 'manage_api_collections',
    permission_options: [
      {
        id: 1,
        label: 'Create',
        value: 'create'
      },
      {
        id: 2,
        label: 'Edit',
        value: 'edit'
      },
      {
        id: 3,
        label: 'Delete',
        value: 'delete'
      },
      {
        id: 4,
        label: 'Update',
        value: 'update'
      },
    ]
  },
  {
    id: 3,
    label: 'API Activity',
    value: 'api_activity',
    permission_options: [
      {
        id: 1,
        label: 'View',
        value: 'view'
      },
      {
        id: 2,
        label: 'Update',
        value: 'update'
      },
    ]
  },
  {
    id: 4,
    label: 'Reports',
    value: 'reports',
    permission_options: [
      {
        id: 1,
        label: 'Generate',
        value: 'generate'
      },
      {
        id: 2,
        label: 'Download',
        value: 'download'
      },
    ]
  },
  {
    id: 5,
    label: 'Consents',
    value: 'consents',
    permission_options: [
      {
        id: 1,
        label: 'View',
        value: 'view'
      },
      {
        id: 2,
        label: 'Edit',
        value: 'edit'
      },
    ]
  },
  {
    id: 6,
    label: 'Manage Members',
    value: 'manage_members',
    permission_options: [
      {
        id: 1,
        label: 'Invite',
        value: 'invite'
      },
      {
        id: 2,
        label: 'Manage Access',
        value: 'manage_access'
      },
      {
        id: 3,
        label: 'Delete',
        value: 'delete'
      }
    ]
  },
  {
    id: 7,
    label: 'Manage Roles',
    value: 'manage_roles',
    permission_options: [
      {
        id: 1,
        label: 'Create',
        value: 'create'
      },
      {
        id: 2,
        label: 'Edit',
        value: 'edit'
      },
    ]
  }
];