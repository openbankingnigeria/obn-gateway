export const authErrors = {
  invalidCredentials: 'Invalid credentials.',
  inadequatePermissions: (action = 'access this resource') =>
    `You do not have permission to ${action.replace(/-/g, ' ')}.`,
  passwordMismatch: 'Passwords do not match.',
  resetPasswordInvalid: 'Reset token is invalid or has expired.',
  accessTokenNotProvided:
    'You must provide an access token to access this resource.',
  errorOccurredCreatingUser:
    'An error occurred while signing you up. Please try again.',
  sameOldPassword: 'Password should not be same as existing one',
  invalidTwoFA: 'Invalid 2FA code.',
  provideTwoFA: 'Please provide a 2FA code to access this resource',
  twoFARequired: '2FA is required on your account to access this resource',
  accountNotActive: (status: string) =>
    `Cannot login, your account is ${status}`,
};
