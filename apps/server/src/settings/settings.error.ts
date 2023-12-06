export const settingsErrors = {
  dto: {
    valueMustContainOnlyType: (
      propertyName: string,
      propertyType: 'alphabets' | 'numbers',
    ) => `${propertyName} value must contain only ${propertyType}.`,
    valueMustBeOfLength: (propertyName: string, propertyLength: number) =>
      `${propertyName} value should have at least ${propertyLength} characters.`,
    isRequired: (propertyName: string) => `${propertyName} is required.`,
  },
};
