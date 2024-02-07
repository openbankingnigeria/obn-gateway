import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const UserFilters: Record<string, AllowedFieldOptions[]> = {
  listUsers: [
    { key: 'email', valueType: ValueTypes.stringLike },
    { key: 'status', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
    { key: 'roleId', valueType: ValueTypes.string },
    {
      key: 'name',
      valueType: ValueTypes.stringLike,
      mapsTo: ['profile.firstName', 'profile.lastName'],
    },
    {
      key: 'phone',
      valueType: ValueTypes.stringLike,
      mapsTo: ['profile.phone'],
    },
  ],
};
