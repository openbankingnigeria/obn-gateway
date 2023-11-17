'use server'

/* DECLINE CONSUMER */
export async function postDeclineConsumer(prevState: any, formData: FormData) {
  const fullData = {
    reason: formData.get('reason'),
  }

  return { message: 'success' };
}

/* APPROVE CONSUMER */
export async function postApproveConsumer(prevState: any, formData: FormData) {
  const fullData = {
    apis: formData.get('apis'),
  }

  return { message: 'success' };
}

/* 2FA VERIFICATION ACTION */
export async function postApp2FAVerification(prevState: any, formData: FormData) {
  const fullData = {
    code: formData.get('code'),
  }

  return { message: 'success' };
}