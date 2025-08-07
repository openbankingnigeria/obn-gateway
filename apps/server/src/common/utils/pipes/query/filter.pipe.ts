import { PipeTransform } from '@nestjs/common';
import {
  isBooleanString,
  isDateString,
  isNumberString,
  isObject,
  isString,
} from 'class-validator';
import {
  AllowedFieldOptions,
  FilterRules,
  ValueTypes,
} from './types/filter.types';
import {
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Like,
} from 'typeorm';

export interface Filtering {
  property: string;
  rule: string;
  value: string;
}

export class FilterPipe implements PipeTransform<any, any> {
  constructor(private readonly allowedFields: AllowedFieldOptions[]) {}

  private validateValueType(
    value: any,
    valueType: ValueTypes,
    returnParsedValue = false,
  ) {
    switch (valueType) {
      case ValueTypes.string:
      case ValueTypes.stringLike:
        return returnParsedValue ? value : isString(value);
      case ValueTypes.number:
        return returnParsedValue ? Number(value) : isNumberString(value);
      case ValueTypes.boolean:
        return returnParsedValue ? value === 'true' : isBooleanString(value);
      case ValueTypes.date:
        return returnParsedValue ? new Date(value) : isDateString(value);
      default:
        return false;
    }
  }

  private generateEachQuery(
    query: any,
    key: string,
    allowedFieldType: ValueTypes,
  ) {
    const result: any = {};
    if (typeof query === 'string') {
      result[key] =
        allowedFieldType === ValueTypes.stringLike
          ? Like(this.validateValueType(`%${query}%`, allowedFieldType, true))
          : this.validateValueType(query, allowedFieldType, true);
    } else {
      const subQueryKeys: any[] = Object.keys(
        query as Record<FilterRules, string>,
      );

      if (subQueryKeys.length <= 0 || subQueryKeys.length > 2) return;

      if (subQueryKeys.length === 2) {
        if (
          subQueryKeys.includes(FilterRules.GREATER_THAN_OR_EQUALS) &&
          subQueryKeys.includes(FilterRules.LESS_THAN_OR_EQUALS)
        ) {
          result[key] = Between(
            this.validateValueType(
              query[FilterRules.GREATER_THAN_OR_EQUALS],
              allowedFieldType,
              true,
            ),
            this.validateValueType(
              query[FilterRules.LESS_THAN_OR_EQUALS],
              allowedFieldType,
              true,
            ),
          );
        } else if (
          subQueryKeys.includes(FilterRules.GREATER_THAN) &&
          subQueryKeys.includes(FilterRules.LESS_THAN)
        ) {
          result[key] = Between(
            this.validateValueType(
              query[FilterRules.GREATER_THAN],
              allowedFieldType,
              true,
            ),
            this.validateValueType(
              query[FilterRules.LESS_THAN],
              allowedFieldType,
              true,
            ),
          );
        }
      } else if (subQueryKeys.length === 1) {
        subQueryKeys.forEach((subKey: FilterRules) => {
          switch (subKey) {
            case FilterRules.GREATER_THAN:
              result[key] = MoreThan(
                this.validateValueType(query[subKey], allowedFieldType, true),
              );
              break;
            case FilterRules.LESS_THAN:
              result[key] = LessThan(
                this.validateValueType(query[subKey], allowedFieldType, true),
              );
              break;
            case FilterRules.GREATER_THAN_OR_EQUALS:
              result[key] = MoreThanOrEqual(
                this.validateValueType(query[subKey], allowedFieldType, true),
              );
              break;
            case FilterRules.LESS_THAN_OR_EQUALS:
              result[key] = LessThanOrEqual(
                this.validateValueType(query[subKey], allowedFieldType, true),
              );
              break;
          }
        });
      }
    }

    return result;
  }

  private convertToQuery(
    query: Record<string, string | Record<FilterRules, string>>,
  ) {
    let result: any = {};

    Object.keys(query).forEach((key) => {
      const allowedFieldType = this.allowedFields.find(
        (allowedField) => allowedField.key === key,
      )!.valueType;

      const fieldMapsTo = this.allowedFields.find(
        (allowedField) => allowedField.key === key,
      )!.mapsTo;

      if (fieldMapsTo) {
        const obj: any = {};
        fieldMapsTo.forEach((fieldMap) => {
          const set = (path: string, value: any, isOr = false) => {
            let schema = obj; // a moving reference to internal objects within obj
            const pList = path.split('.');
            const len = pList.length;
            for (let i = 0; i < len - 1; i++) {
              const elem = pList[i];
              if (isOr) {
                if (i === len - 2) {
                  if (!schema[elem]) schema[elem] = [];
                  schema[elem].push({ [pList[i + 1]]: value });
                  i += 10;
                } else {
                  if (!schema[elem]) schema[elem] = {};
                  schema = schema[elem];
                }
              } else {
                if (!schema[elem]) schema[elem] = {};
                schema = schema[elem];
                schema[pList[len - 1]] = value;
              }
            }
          };

          set(
            fieldMap,
            this.generateEachQuery(query[key], key, allowedFieldType)[key],
            fieldMapsTo.length > 1,
          );
        });
        result = { ...result, ...obj };
      } else {
        const subQuery = this.generateEachQuery(
          query[key],
          key,
          allowedFieldType,
        );
        result = { ...result, ...subQuery };
      }
    });

    return result;
  }

  transform(query: any) {
    // 1. Check if the filter is present in the request query
    if (!query.filter) return;

    const { filter } = query;

    // 2. Check if any of the allowed fields for this query are present in the request query filter
    if (
      !this.allowedFields.some(({ key }) => Object.keys(filter).includes(key))
    )
      return;

    // 3. Remove unwanted and invalid fields from the request query filter. Invalid fields are those whose type is not consistent with the expected type
    const parsedFilter = Object.fromEntries(
      Object.entries(filter).filter(([key, filterValue]) => {
        if (isObject(filterValue)) {
          const allowedField = this.allowedFields.find(
            (field) => field.key === key
          );
          
          if (!allowedField) return false;

          return (
            // Check all filter keys are valid FilterRules
            Object.keys(filterValue).every((filterKey) => 
              Object.values(FilterRules).includes(filterKey as FilterRules)
            ) &&
            // Check all filter values match the expected type
            Object.values(filterValue).every((value) =>
              this.validateValueType(value, allowedField.valueType)
            )
          );
        } else {
          return this.allowedFields.some((field) => field.key === key);
        }
      })
    );

    // 4. Convert the parsed query to a typeorm compatible query
    const finalQuery = this.convertToQuery(parsedFilter as any);

    return finalQuery;
  }
}
