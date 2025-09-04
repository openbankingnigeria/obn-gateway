"use server";

import { cookies } from "next/headers";

export const deleteCookies = async (key: string) => {
  (await cookies()).delete(key);
};
