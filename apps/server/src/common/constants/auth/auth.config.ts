export const authConfig = {
  minNameLength: 2,
};

export const authValidationErrors = {
  dto: {
    valueMustContainOnlyType: (
      propertyName: string,
      propertyType: 'alphabets' | 'numbers',
    ) => `${propertyName} value must contain only ${propertyType}.`,
    valueMustBeOfLength: (propertyName: string, propertyLength: number) =>
      `${propertyName} value should have at least ${propertyLength} characters.`,
    isRequired: (propertyName: string) => `${propertyName} value is empty.`,
    passwordStructureMismatch: (propertyName: string) =>
      `${propertyName} value must contain at least one number, one special character, one uppercase and one lowercase letter.`,
    invalidPhone: 'phone value must be a valid phone number.',
  },
};
