'use server'

import { redirect } from 'next/navigation';

/* CHANGE PASSWORD ACTION */
export async function postChangePassword(prevState: any, formData: FormData) {
  const fullData = {
    old_password: formData.get('old_password'),
    password: formData.get('password'),
    confirm_password: formData.get('confirm_password'),
  };

  redirect(`/app/profile?status=successful`);
}

/* ADD BUSINESS INFORMATION ACTION */
export async function postAddBusinessInfo(prevState: any, formData: FormData) {
  const fullData = {
    cac: formData.get('cac'),
    regulator_license: formData.get('regulator_license'),
    certificate_of_incorporation: formData.get('certificate_of_incorporation'),
    tin: formData.get('tin'),
    company_status_report: formData.get('company_status_report'),
  };

  return { message: 'success' }
}