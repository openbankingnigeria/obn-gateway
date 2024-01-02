export const commonErrors = {
  genericError: 'An error occurred. Please contact support.',
  invalidValue: (fieldName: string, value: string) =>
    `"${value}" is not a valid value for ${fieldName}.`,
};
