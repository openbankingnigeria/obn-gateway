export const profileSuccessMessages = {
  fetchedProfile: 'Successfully fetched profile',
  updatedProfile: 'Successfully updated profile',
  updatedPassword: 'Successfully updated password',
  generatedTwoFA: 'Successfully generated 2FA code',
  twoFaEnabled: 'Successfully enabled 2FA',
  twoFaDisabled: 'Successfully disabled 2FA',
};

export const profileErrorMessages = {
  sameOldPassword: 'New password cannot be the same as old password.',
  passwordMismatch: 'Passwords do not match.',
  incorrectTwoFaCode: 'Incorrect 2FA code.',
  incorrectOldPassword: 'Incorrect current password',
  twoFaAlreadyEnabled: '2FA is already enabled on your account',
  twoFaAlreadyDisabled: '2FA is already disabled on your account',
};
