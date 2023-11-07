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

/* CREATE ROLE */
export async function postCreateRole(prevState: any, formData: FormData) {
  const schema = z.object({
    role_name: z.string(),
    description: z.string()
  })

  const parsed = schema.parse({
    role_name: formData.get('role_name'),
    description: formData.get('description')
  })

  return { message: 'success' };
}

/* UPDATE ROLE */
export async function updateRole(prevState: any, formData: FormData) {
  const schema = z.object({
    role_name: z.string(),
    description: z.string()
  })

  const parsed = schema.parse({
    role_name: formData.get('role_name'),
    description: formData.get('description')
  })

  return { message: 'success' };
}