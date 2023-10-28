'use server'

import { redirect } from 'next/navigation';
import { z } from 'zod';

/* CHANGE PASSWORD ACTION */
export async function postChangePassword(prevState: any, formData: FormData) {
  const schema = z.object({
    old_password: z.string(),
    password: z.string(),
    confirm_password: z.string(),
  })

  const parsed = schema.parse({
    old_password: formData.get('old_password'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  })

  redirect(`/app/profile?status=successful`);
}