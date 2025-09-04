'use server'

import { cookies } from 'next/headers'

export const setCookies = async (
  key: string, 
  value: any,
  options: any = {}
) => {
  (await cookies()).set(key, value)
}