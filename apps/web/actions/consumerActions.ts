'use server'

import { z } from 'zod';

/* 2FA VERIFICATION ACTION */
export async function postApp2FAVerification(prevState: any, formData: FormData) {
  const schema = z.object({
    code: z.string(),
  })

  const parsed = schema.parse({
    code: formData.get('code'),
  })

  return { message: 'success' };
}