import { CompanyTypes } from '@common/database/constants';

// const sharedFields: Record<string, { type: string; label: string }> = {
//   firstName: { label: 'First Name', type: 'text' },
//   lastName: { label: 'Last Name', type: 'text' },
//   companyType: { label: 'User Type', type: 'dropdown' },
// };

export const companyCustomFields: Omit<
  Record<CompanyTypes, Record<string, { type: string; label: string }>>,
  'api-provider'
> = {
  business: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
    confirmPassword: { label: 'Confirm Password', type: 'password' },
    phone: { label: 'Phone Number', type: 'text' },
    accountNumber: { label: 'Account Number', type: 'text' },
    companyName: { label: 'Corporate Name', type: 'text' },
    rcNumber: {
      label: 'CAC (Corporate Affairs Commission) Number',
      type: 'text',
    },
    companySubType: { label: 'Company Type', type: 'dropdown' },
  },
  individual: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' },
    confirmPassword: { label: 'Confirm Password', type: 'password' },
    phone: { label: 'Phone Number', type: 'text' },
    accountNumber: { label: 'Account Number', type: 'text' },
    bvn: { label: 'BVN', type: 'text' },
  },
  ['licensed-entity']: {
    email: { label: 'Official Email Address', type: 'email' },
    password: { label: 'Password', type: 'password' },
    confirmPassword: { label: 'Confirm Password', type: 'password' },
    phone: { label: 'Phone Number', type: 'text' },
    companyName: { label: 'Company Name', type: 'text' },
    companySubType: { label: 'Company Type', type: 'dropdown' },
  },
};
