'use server'

import { z } from 'zod';

/* INVITE MEMBER */
export async function postInviteMember(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string(),
    role: z.string()
  })

  const parsed = schema.parse({
    email: formData.get('email'),
    role: formData.get('role')
  })

  return { message: 'You sent an invite to [email_address]' };
}