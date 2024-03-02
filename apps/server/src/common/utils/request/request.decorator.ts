import {
  ValidationOptions,
  isNumberString,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

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

export const IsNumberOrArrayOfNumbers = (
  validationOptions?: ValidationOptions,
) => {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsNumberOrArrayOfNumbers',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, validationArguments: ValidationArguments) {
          console.log(validationArguments);
          // TODO find more efficient way to fix es query for numbers
          if (isNumberString(value)) {
            // @ts-ignore
            validationArguments.object[validationArguments.property] =
              Number(value);
            return true;
          }
          if (
            Array.isArray(value) &&
            value.every((item) => isNumberString(item))
          ) {
            value = value.map((v, i) => {
              // @ts-ignore
              validationArguments.object[validationArguments.property][i] =
                Number(v);
            });
            return true;
          }
          return false;
        },
        defaultMessage() {
          return 'Expected a number or array of numbers';
        },
      },
    });
  };
};
