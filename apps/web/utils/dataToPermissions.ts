import { PermissionArrayItem, PermissionItem } from "@/types/utilTypes";

export const dataToPermissions = (inputArray: any[], type: string = 'array'): any[] => {
  const permissionsMap: { [key: string]: PermissionItem[] } = {};

  let sanitizedArray = inputArray?.map((data: any) => {
    const old_slug = data?.slug;
    const new_slug = (
      // old_slug?.includes('list') && 
      old_slug?.charAt(old_slug?.length - 1) != 's'
    ) ? `${old_slug}s` : old_slug;

    return ({
      ...data,
      slug: new_slug
    });
  })

  sanitizedArray?.forEach((item: any) => {
    const parts: string[] = item?.slug?.split('-');
    const permissionKey: string = parts?.slice(1)?.join('-');

    if (!permissionsMap[permissionKey]) {
      permissionsMap[permissionKey] = [];
    }

    permissionsMap[permissionKey]?.push({
      id: item.id,
      label: parts[0],
      value: parts[0]
    });
  });

  const resultArray: PermissionArrayItem[] = Object.entries(permissionsMap)?.map(([key, value]) => ({
    label: key?.replace(/-/g, ' ')?.replace('api', 'API'),
    value: key,
    permission_options: value,
  }));

  const resultStrings: string[] = Object.entries(permissionsMap)?.map(([key, value]) => {
    return (
      `${key?.replace(/-/g, ' ')?.replace('api', 'API')}: ${value?.map(x => x?.value)}`
    );
  });

  const resultAnswer: any[] = Object.entries(permissionsMap)?.map(([key, value]) => ({
    permission: key,
    options: value,
  }));

  return (
    type == 'string' ? 
      resultStrings : 
      type == 'answer' ?
        resultAnswer :
        resultArray
  );
}