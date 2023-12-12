import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const CollectionFilters: Record<string, AllowedFieldOptions[]> = {
  listCollections: [
    { key: 'name', valueType: ValueTypes.string },
    { key: 'slug', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
  ],
};

export const APIFilters: Record<string, AllowedFieldOptions[]> = {
  listAPIs: [
    { key: 'name', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
  ],
};
