import { CompanyTypes } from '../common/database/constants';

export const BUSINESS_SETTINGS_NAME = 'business_settings';

export const defaultBusinessSettings = {
  uneditableFields: ['taxIdentificationNumber', 'registryLicense'],
  kybRequirements: [
    {
      name: 'taxIdentificationNumber',
      label: 'Tax Identification Number',
      type: 'string',
      editable: false,
      length: 15,
    },
    {
      name: 'registryLicense',
      label: 'Registry License',
      type: 'file',
      editable: false,
      maxCount: 1,
    },
    {
      name: 'companyStatusReport',
      label: 'Company Status Report',
      type: 'file',
      editable: true,
      maxCount: 1,
    },
    {
      name: 'certificateOfIncorporation',
      label: 'Certificate Of Incorporation',
      type: 'file',
      editable: true,
      maxCount: 1,
    },
  ],
  companySubtypes: {
    [CompanyTypes.INDIVIDUAL]: [],
    [CompanyTypes.LICENSED_ENTITY]: [
      { value: 'Commercial Bank', default: true },
      { value: 'Merchant Bank', default: true },
      { value: 'Non-interest Bank', default: true },
      { value: 'Microfinance Bank', default: true },
      { value: 'Finance House', default: true },
      { value: 'Payments Solutions Services Provider', default: true },
      { value: 'Super Agent', default: true },
      { value: 'Mobile Money Operator', default: true },
      { value: 'Switch and Processor', default: true },
      { value: 'Payments Solutions Services', default: true },
      { value: 'Payments Terminal Services Provider', default: true },
      { value: 'Insurance', default: true },
      { value: 'Capital Market Operator', default: true },
      { value: 'Others', default: true },
    ],
    [CompanyTypes.BUSINESS]: [
      { value: 'Telecommunications', default: true },
      { value: 'Manufacturer', default: true },
      { value: 'Healthcare', default: true },
      { value: 'Logistics', default: true },
      { value: 'Real Estate', default: true },
      { value: 'Entertainment', default: true },
      { value: 'Hospitality', default: true },
      { value: 'Technology', default: true },
      { value: 'Medical', default: true },
      { value: 'Public Sector', default: true },
      { value: 'Others', default: true },
    ],
  },
};
