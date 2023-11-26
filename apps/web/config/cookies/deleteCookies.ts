'use server'

import { cookies } from 'next/headers'

export const deleteCookies = (key: string) => {
  cookies().delete(key)
}