export const companyErrors = {
  fileTooLarge: (maxFileSize: number) =>
    `Files uploaded must be less than ${maxFileSize / (1024 * 1024)}MB`,
  invalidFileType: 'File must be either a .jpg, .jpeg, .png or .pdf file',
  companyAlreadyVerified:
    'Your business has already been verified. You cannot update this information',
  noKybDetailsFound: 'No KYB details were found for this company',
  companyNotFound: (companyId?: string) =>
    `No company found with ID - ${companyId}`,
  businessNotFoundOnRegistry: (rcNumber: string) =>
    `No business with RC number - ${rcNumber} found in registry.`,
  reasonNotProvided:
    'A reason must be provided when denying a company KYB approval request.',
};
