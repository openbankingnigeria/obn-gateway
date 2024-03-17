export const findPermissionSlug = (permissions: any[], slugs: string) => {
  if (typeof slugs !== 'string' || !slugs) {
    return true; 
  }

  let slugArray = slugs?.split(',');
    const objectSlugs = permissions?.map(permit => permit?.slug);
    for (const slug of slugArray) {
      if (objectSlugs?.includes(slug?.trim())) {
        return true;
      }
    }
    return false;
};
