'use server'

import { redirect } from 'next/navigation';
import { z } from 'zod';

/* SIGNIN ACTION */
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

/* ACCOUNT SETUP ACTION */
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

/* 2FA VERIFICATION ACTION */
export async function post2FAVerification(prevState: any, formData: FormData) {
  const schema = z.object({
    code: z.string(),
  })

  const parsed = schema.parse({
    code: formData.get('code'),
  })

    prevState?.location?.includes('reset-password') ?
      redirect(`/reset-password?status=successful`) :
      redirect(`/app/dashboard`);
}

/* INITIATE PASSWORD RESET ACTION */
export async function postInitiatePasswordReset(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
  })

  const parsed = schema.parse({
    email: formData.get('email'),
  })

  redirect(`/forget-password?status=successful`);
}

/* REINITIATE PASSWORD RESET ACTION */
export async function postReInitiatePasswordReset(prevState: any, formData: FormData) {
  const schema = z.object({
    email: z.string().email(),
  })

  const parsed = schema.parse({
    email: formData.get('email'),
  })
}

/* RESET PASSWORD ACTION */
export async function postResetPassword(prevState: any, formData: FormData) {
  const schema = z.object({
    password: z.string(),
    confirm_password: z.string(),
  })

  const parsed = schema.parse({
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  })

  // redirect(`/reset-password?status=successful`);
  redirect(`/reset-password/2fa`);
}