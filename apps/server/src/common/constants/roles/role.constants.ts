export const DEFAULT_ADMIN_ROLE = 'ADMIN';

export const roleSuccessMessages = {
  createdRole: 'Successfully created role',
  fetchedRole: 'Successfully fetched role',
  updatedRole: 'Successfully updated role',
  deletedRole: 'Successfully deleted role',
  fetchedPermissions: 'Successfully fetched permissions',
};

export const roleErrorMessages = {
  permissionNotFound: (id: string) => `Permission '${id}' does not exist`,
};
