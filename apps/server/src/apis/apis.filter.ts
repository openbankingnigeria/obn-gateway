import {
  AllowedFieldOptions,
  ValueTypes,
} from '@common/utils/pipes/query/types/filter.types';

export const APIFilters: { [k: string]: AllowedFieldOptions[] } = {
  listAPIs: [
    { key: 'name', valueType: ValueTypes.stringLike },
    { key: 'collectionId', valueType: ValueTypes.string },
    { key: 'createdAt', valueType: ValueTypes.date },
  ],
};
