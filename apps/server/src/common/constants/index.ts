export const commonErrors = {
  genericError: 'An error occurred. Please contact support.',
  genericNoAccessError:
    'You do not have access to this feature. Please contact support for assistance.',
  invalidValue: (fieldName: string, value: string) =>
    `"${value}" is not a valid value for ${fieldName}.`,
};
