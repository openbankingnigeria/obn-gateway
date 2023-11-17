'use server'

/* GENERAL SETTINGS */
export async function updateGeneraSettings(prevState: any, formData: FormData) {
  const fullData = {
    inactivity_timeout: formData.get('inactivity_timeout'),
    request_timeout: formData.get('request_timeout'),
    auth_token_expiration_duration: formData.get('auth_token_expiration_duration'),
    password_reset_token_expiration_duration: formData.get('password_reset_token_expiration_duration'),
    two_fa_expiration_duration: formData.get('two_fa_expiration_duration'),
    invitation_token_expiration_duration: formData.get('invitation_token_expiration_duration'),
    failed_login_attempts: formData.get('failed_login_attempts'),
  };

  return { message: 'Settings saved successfully' };
}


/* EMAIL SERVICE */
export async function updateEmailService(prevState: any, formData: FormData) {
  const fullData = {
    email_provider: formData.get('email_provider'),
    email_key: formData.get('email_key'),
    email_sender_id: formData.get('email_sender_id'),
    email_base_url: formData.get('email_base_url'),
  }

  return { message: 'Settings saved successfully' };
}

/* EMAIL TEMPLATE */
export async function updateNewMemberInvite(prevState: any, formData: FormData) {
  const fullData = {
    subject: formData.get('subject'),
    group: formData.get('group')
  }

  return { message: 'Settings saved successfully' };
}


/* EXTERNAL SERVICES */
export async function updateExternalServices(prevState: any, formData: FormData) {
  const fullData = {
    url: formData.get('url'),
    api_key: formData.get('api_key')
  }

  return { message: 'Settings saved successfully' };
}

/* MOCK SERVICES */
export async function updateMockServices(prevState: any, formData: FormData) {
  const fullData = {
    mock_url: formData.get('mock_url')
  }

  return { message: 'Settings saved successfully' };
}