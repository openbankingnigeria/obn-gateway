export const authSuccessMessages = {
  signup: 'You have successfully signed up.',
  login: (isFirstLogin: boolean) =>
    `Welcome${isFirstLogin ? '' : ' back'}.You have successfully signed up.`,
  forgotPassword: (email: string) =>
    `An email with instructions to reset your password has been sent to ${email}`,
  resetPassword:
    'Your password has been successfully reset. Please proceed to login.',
  changePassword: 'Your password has been successfully changed.',
};
