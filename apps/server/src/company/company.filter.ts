import { ValueTypes } from '@common/utils/pipes/query/types/filter.types';

export const CompanyFilters = {
  getCompanies: [
    { key: 'createdAt', valueType: ValueTypes.date },
    { key: 'name', valueType: ValueTypes.string },
    { key: 'rcNumber', valueType: ValueTypes.string },
    { key: 'isVerified', valueType: ValueTypes.boolean },
    { key: 'kybStatus', valueType: ValueTypes.string },
    { key: 'type', valueType: ValueTypes.string },
  ],
};
