'use server'

import { z } from 'zod';

/* API CONFIGURATION */
export async function postConfigureAPI(prevState: any, formData: FormData) {
  const schema = z.object({
    parameters: z.string(),
    endpoint_url: z.any()
  })

  const parsed = schema.parse({
    parameters: formData.get('parameters'),
    endpoint_url: formData.get('endpoint_url')
  })

  return { message: 'success' };
}

/* MODIFY API CONFIGURATION */
export async function modifyConfigureAPI(prevState: any, formData: FormData) {
  const schema = z.object({
    parameters: z.string(),
    endpoints_url: z.any()
  })

  const parsed = schema.parse({
    parameters: formData.get('parameters'),
    endpoint_url: formData.get('endpoint_url')
  })

  return { message: 'success' };
}