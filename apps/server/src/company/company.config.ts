export const companyValidationErrors = {
  dto: {
    isRequired: (propertyName: string) => `${propertyName} is required.`,
    typeMismatch: (
      propertyName: string,
      type: 'alphabets' | 'numbers' | 'alphabets and numbers',
    ) => `${propertyName} must contain only ${type}.`,
  },
};
