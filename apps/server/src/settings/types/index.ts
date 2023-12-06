export enum KybDataTypes {
  FILE = 'file',
  STRING = 'string',
}

export interface KybSettings {
  uneditableFields: string[];
  kybRequirements: {
    name: string;
    label: string;
    type: string;
    editable: boolean;
  }[];
}
