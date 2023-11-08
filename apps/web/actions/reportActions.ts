'use server'

import { z } from 'zod';

/* GENERATE REPORT */
export async function postGenerateReport(prevState: any, formData: FormData) {
  const schema = z.object({
    report_type: z.string(),
    from: z.string(),
    to: z.string(),
    // consumers: z.array(z.string())
  })

  const parsed = schema.parse({
    report_type: formData.get('report_type'),
    from: formData.get('from'),
    to: formData.get('to'),
    // consumers: formData.get('consumers'),
  })

  return { message: 'success' };
}