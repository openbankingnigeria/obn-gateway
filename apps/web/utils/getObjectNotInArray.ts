export const getObjectsNotInArrayB = (arrayA: any[], arrayB: any[]) => {
  const result = arrayA.filter((objA) => {
    return !arrayB.some((objB) => objB.id === objA.id);
  });

  return result;
}