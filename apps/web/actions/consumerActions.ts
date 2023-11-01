'use server'

import { z } from 'zod';

/* DECLINE CONSUMER */
export async function postDeclineConsumer(prevState: any, formData: FormData) {
  const schema = z.object({
    reason: z.string(),
  })

  const parsed = schema.parse({
    reason: formData.get('reason'),
  })

  return { message: 'success' };
}

/* APPROVE CONSUMER */
export async function postApproveConsumer(prevState: any, formData: FormData) {
  const schema = z.object({
    apis: z.string(),
  })

  const parsed = schema.parse({
    apis: formData.get('apis'),
  })

  return { message: 'success' };
}

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