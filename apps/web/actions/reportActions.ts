'use server'

/* GENERATE REPORT */
export async function postGenerateReport(prevState: any, formData: FormData) {
  const fullData = {
    report_type: formData.get('report_type'),
    from: formData.get('from'),
    to: formData.get('to'),
    consumers: formData.get('consumers'),
  }

  return { message: 'success' };
}