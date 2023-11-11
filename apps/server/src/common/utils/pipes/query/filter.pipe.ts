import { PipeTransform } from '@nestjs/common';
import { LessThan, Like, MoreThan } from 'typeorm';

export enum FilterTypes {
  RANGE = 'range',
  VALUE = 'value',
}

export class FilterPipe implements PipeTransform<any, any> {
  constructor(
    private readonly allowedFields: {
      key: string;
      type: FilterTypes;
      mapsTo?: string;
      valueType?: 'date' | 'string' | 'number' | 'boolean';
    }[],
  ) {}

  transform(query: any) {
    let result: any = {};

    // Structure the query to match the type orm query
    this.allowedFields.forEach((field) => {
      // If the field exists in the query object proceed
      if (query[field.key]) {
        switch (field.type) {
          // For ranges the key structure would be [field]-gt|lt e.g., createdAt-gt. Any field not matching this structure would be omitted.
          case FilterTypes.RANGE:
            const splitKey = field.key.split('-');
            result[splitKey[0]] =
              splitKey[1] === 'gt'
                ? MoreThan(
                    field.valueType === 'date'
                      ? new Date(query[field.key])
                      : query[field.key],
                  )
                : LessThan(
                    field.valueType === 'date'
                      ? new Date(query[field.key])
                      : query[field.key],
                  );

            break;
          case FilterTypes.VALUE:
            const resultFragment: any = {};
            // this handles for nested filtering.
            if (field.mapsTo) {
              const mapArray = field.mapsTo?.split('.');

              mapArray.forEach((mapValue, index) => {
                const resultFragmentKeys = Object.keys(resultFragment);
                const value =
                  index === mapArray.length - 1 ? Like(query[field.key]) : {};
                if (resultFragmentKeys.length > 0) {
                  resultFragment[resultFragmentKeys[0]][mapValue] = value;
                } else {
                  resultFragment[mapValue] = value;
                }
              });
            } else {
              resultFragment[field.key] = Like(query[field.key]);
            }

            result = { ...result, ...resultFragment };
            break;
        }
      }
    });
    return result;
  }
}
