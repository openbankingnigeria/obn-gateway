'use server'

import { cookies } from 'next/headers'

export const setCookies = (
  key: string, 
  value: any,
  options: any = {}
) => {
  cookies().set(key, value)
}