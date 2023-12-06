import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const UserFilters: Record<string, AllowedFieldOptions[]> = {
  listUsers: [
    { key: 'email', valueType: ValueTypes.string },
    { key: 'status', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
    { key: 'roleId', valueType: ValueTypes.string },
    {
      key: 'name',
      valueType: ValueTypes.string,
      mapsTo: ['profile.firstName', 'profile.lastName'],
    },
    {
      key: 'phone',
      valueType: ValueTypes.string,
      mapsTo: ['profile.phone', 'profile.phone'],
    },
  ],
};
