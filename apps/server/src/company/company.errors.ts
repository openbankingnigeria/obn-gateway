export const companyErrors = {
  fileTooLarge: (maxFileSize: number) =>
    `Files uploaded must be less than ${maxFileSize / (1024 * 1024)}MB`,
  companyAlreadyVerified:
    'Your business has already been verified. You cannot update this information',
  noKybDetailsFound: 'No KYB details were found for this company',
  companyNotFound: (companyId: string) =>
    `No company found with ID - ${companyId}`,
};
