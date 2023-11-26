'use server'

import { cookies } from 'next/headers'

export const getCookies = (key: string) => {
  return cookies().get(key)?.value;
}