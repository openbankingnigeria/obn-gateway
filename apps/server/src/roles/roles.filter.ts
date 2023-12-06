import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const RoleFilters: Record<string, AllowedFieldOptions[]> = {
  listRoles: [
    { key: 'name', valueType: ValueTypes.string },
    { key: 'status', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
  ],
};
