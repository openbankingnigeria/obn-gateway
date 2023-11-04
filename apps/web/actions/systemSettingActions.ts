'use server'

import { z } from 'zod';

/* GENERAL SETTINGS */
export async function updateGeneraSettings(prevState: any, formData: FormData) {
  const schema = z.object({
    inactivity_timeout: z.string(),
    request_timeout: z.string(),
    auth_token_expiration_duration: z.string(),
    password_reset_token_expiration_duration: z.string(),
    two_fa_expiration_duration: z.string(),
    invitation_token_expiration_duration: z.string(),
    failed_login_attempts: z.string(),
  })

  const parsed = schema.parse({
    inactivity_timeout: formData.get('inactivity_timeout'),
    request_timeout: formData.get('request_timeout'),
    auth_token_expiration_duration: formData.get('auth_token_expiration_duration'),
    password_reset_token_expiration_duration: formData.get('password_reset_token_expiration_duration'),
    two_fa_expiration_duration: formData.get('two_fa_expiration_duration'),
    invitation_token_expiration_duration: formData.get('invitation_token_expiration_duration'),
    failed_login_attempts: formData.get('failed_login_attempts'),
  })

  console.log(parsed);
  return { message: 'Settings saved successfully' };
}


/* EMAIL SERVICE */
export async function updateEmailService(prevState: any, formData: FormData) {
  const schema = z.object({
    email_provider: z.string(),
    email_key: z.string(),
    email_sender_id: z.string(),
    email_base_url: z.string(),
  })

  const parsed = schema.parse({
    email_provider: formData.get('email_provider'),
    email_key: formData.get('email_key'),
    email_sender_id: formData.get('email_sender_id'),
    email_base_url: formData.get('email_base_url'),
  })

  console.log(parsed);
  return { message: 'Settings saved successfully' };
}

/* EMAIL TEMPLATE */
export async function updateNewMemberInvite(prevState: any, formData: FormData) {
  const schema = z.object({
    subject: z.string(),
    group: z.string()
  })

  const parsed = schema.parse({
    subject: formData.get('subject'),
    group: formData.get('group')
  })

  console.log(parsed);
  return { message: 'Settings saved successfully' };
}


/* EXTERNAL SERVICES */
export async function updateExternalServices(prevState: any, formData: FormData) {
  const schema = z.object({
    url: z.string(),
    api_key: z.string()
  })

  const parsed = schema.parse({
    url: formData.get('url'),
    api_key: formData.get('api_key')
  })

  console.log(parsed);
  return { message: 'Settings saved successfully' };
}

/* MOCK SERVICES */
export async function updateMockServices(prevState: any, formData: FormData) {
  const schema = z.object({
    mock_url: z.string()
  })

  const parsed = schema.parse({
    mock_url: formData.get('mock_url')
  })

  console.log(parsed);
  return { message: 'Settings saved successfully' };
}