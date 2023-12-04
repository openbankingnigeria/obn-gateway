import { ValueTypes } from '@common/utils/pipes/query/types/filter.types';

export const RoleFilters = {
  listRoles: [
    { key: 'name', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
  ],
};
