import { CompanyTypes } from '@common/database/constants';

export enum KybDataTypes {
  FILE = 'file',
  STRING = 'string',
}

export type CompanySubtypes = Record<
  | CompanyTypes.INDIVIDUAL
  | CompanyTypes.LICENSED_ENTITY
  | CompanyTypes.BUSINESS,
  string[]
>;

export interface SystemSettings {
  uneditableFields: string[];
  kybRequirements: {
    name: string;
    label: string;
    type: string;
    editable: boolean;
    length?: number;
  }[];
  companySubtypes: CompanySubtypes;
}
