import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const CompanyFilters: Record<string, AllowedFieldOptions[]> = {
  getCompanies: [
    { key: 'createdAt', valueType: ValueTypes.date },
    { key: 'name', valueType: ValueTypes.string },
    { key: 'rcNumber', valueType: ValueTypes.string },
    { key: 'isVerified', valueType: ValueTypes.boolean },
    { key: 'type', valueType: ValueTypes.string },
  ],
};
