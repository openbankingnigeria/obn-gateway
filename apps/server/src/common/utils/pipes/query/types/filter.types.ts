export enum FilterTypes {
  RANGE = 'range',
  VALUE = 'value',
}

export enum ValueTypes {
  date = 'date',
  string = 'string',
  number = 'number',
  boolean = 'boolean',
}

// valid filter rules
export enum FilterRules {
  GREATER_THAN = 'gt',
  GREATER_THAN_OR_EQUALS = 'gte',
  LESS_THAN = 'lt',
  LESS_THAN_OR_EQUALS = 'lte',
}

export interface AllowedFieldOptions {
  key: string;
  mapsTo?: string[];
  valueType: ValueTypes;
}
