export enum KybDataTypes {
  FILE = 'file',
  STRING = 'string',
}

export type CompanySubtypes = Record<
  'individual' | 'licensedEntity' | 'business',
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
