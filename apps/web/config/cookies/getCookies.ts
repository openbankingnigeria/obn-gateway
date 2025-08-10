"use server";

import { cookies } from "next/headers";

export const getCookies = async (key: string) => {
  return (await cookies()).get(key)?.value;
};
