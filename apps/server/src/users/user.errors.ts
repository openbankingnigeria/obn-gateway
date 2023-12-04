export const userConfig = {
  minNameLength: 2,
  minPasswordLength: 8,
  minPasswordSpecialCharacter: 1,
  minPasswordLowercase: 1,
  minPasswordUppercase: 1,
  minPasswordNumber: 1,
};

const {
  minPasswordLength,
  minPasswordLowercase,
  minPasswordNumber,
  minPasswordSpecialCharacter,
  minPasswordUppercase,
} = userConfig;

export const userErrors = {
  userWithEmailNotFound: (email: string) =>
    `User with email '${email}' not found.`,
  userWithEmailAlreadyExists: (email: string) =>
    `A user with email '${email}' already exists.`,
  userNotFound: `User not found.`,
  cannotUpdateSelf: `You cannot update your user.`,
  cannotDeleteSelf: `You cannot deleted your user.`,
  provide2FACode: `Please provide 2FA code`,
  dto: {
    valueMustContainOnlyType: (
      propertyName: string,
      propertyType: 'alphabets' | 'numbers',
    ) => `${propertyName} value must contain only ${propertyType}.`,
    valueMustBeOfLength: (propertyName: string, propertyLength: number) =>
      `${propertyName} value should have at least ${propertyLength} characters.`,
    isRequired: (propertyName: string) => `${propertyName} is required.`,
    passwordStrengthMismatch: (propertyName: string) =>
      `${propertyName} value must contain at least ${minPasswordNumber} number, ${minPasswordSpecialCharacter} special character, ${minPasswordUppercase} uppercase and ${minPasswordLowercase} lowercase letter and be at least ${minPasswordLength} characters in length.`,
    invalidPhone: 'phone value must be a valid phone number.',
  },
};
