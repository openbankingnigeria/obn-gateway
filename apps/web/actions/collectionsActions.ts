'use server'

/* API CONFIGURATION */
export async function postConfigureAPI(prevState: any, formData: FormData) {
  const fullData = {
    parameters: formData.get('parameters'),
    endpoint_url: formData.get('endpoint_url')
  }

  return { message: 'success' };
}

/* MODIFY API CONFIGURATION */
export async function modifyConfigureAPI(prevState: any, formData: FormData) {
  const fullData = {
    parameters: formData.get('parameters'),
    endpoint_url: formData.get('endpoint_url')
  }

  return { message: 'success' };
}