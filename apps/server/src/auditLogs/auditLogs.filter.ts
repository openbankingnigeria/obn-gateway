import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const AuditLogFilters: Record<string, AllowedFieldOptions[]> = {
  getLogs: [
    { key: 'event', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
    {
      key: 'name',
      valueType: ValueTypes.string,
      mapsTo: ['user.profile.firstName', 'user.profile.lastName'],
    },
    {
      key: 'email',
      valueType: ValueTypes.string,
      mapsTo: ['user.profile.email'],
    },
  ],
};
