export const userErrors = {
  userWithEmailNotFound: (email: string) =>
    `User with email '${email}' not found.`,
  userWithEmailAlreadyExists: (email: string) =>
    `A user with email '${email}' already exists.`,
  userNotFound: `User not found.`,
};
