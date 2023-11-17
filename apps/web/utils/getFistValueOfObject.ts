export const getFirstValueOfObject = (obj: any) => {
  const firstKey = Object.keys(obj)[0];
  const firstValue = obj[firstKey];

  return obj ? firstValue : null;
}