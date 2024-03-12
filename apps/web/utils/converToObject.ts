import { ConverToObjectProps } from "@/types/utilTypes";

export const converToObject = (
  originalObject: ConverToObjectProps
) => {
  const { key, ...rest } = originalObject;
  return { [key]: rest };
}