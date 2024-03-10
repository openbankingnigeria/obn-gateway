export const findPermissionSlug = (permissions: any[], slug: string) => {
  let slugArray = slug?.split(',');

  const isPermitPresent = permissions?.some(
    (permission: any) => {
      return (
        Boolean(slugArray?.some(slug => permission?.slug?.includes(slug)) || !slug)
      );
    }
  );

  return isPermitPresent;
};
