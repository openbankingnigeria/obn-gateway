import { ValidationOptions, registerDecorator } from 'class-validator';

export const IsStringOrArrayOfStrings = (
  validationOptions?: ValidationOptions,
) => {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isStringOrArrayOfStrings',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return (
            typeof value === 'string' ||
            (Array.isArray(value) &&
              value.every((item) => typeof item === 'string'))
          );
        },
      },
    });
  };
};
