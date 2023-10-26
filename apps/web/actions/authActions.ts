'use server'

import { redirect } from 'next/navigation';
import { z } from 'zod';

export async function postSignIn(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
    password: z.string(),
  })

  const parsed = schema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  redirect(`/signin/2fa`);
}

export async function postAccountSetUp(prevState: any, formData: FormData) {
  const schema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    password: z.string(),
    confirm_password: z.string(),
  })

  const parsed = schema.parse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  })

  redirect(`/account-setup?status=successful`);
}

export async function post2FAVerification(prevState: any, formData: FormData) {
  const schema = z.object({
    code: z.string(),
  })

  const parsed = schema.parse({
    code: formData.get('code'),
  })

  redirect(`/app/dashboard`);
}

export async function postInitiatePasswordReset(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
  })

  const parsed = schema.parse({
    email: formData.get('email'),
  })

  redirect(`/forget-password?status=successful`);
}

export async function postReInitiatePasswordReset(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
  })

  const parsed = schema.parse({
    email: formData.get('email'),
  })
}