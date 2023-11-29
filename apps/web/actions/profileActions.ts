'use server'

import { axiosRequest } from '@/config/axiosRequest';
import * as API from '../config/endpoints';
import { redirect } from 'next/navigation';

/* CHANGE PASSWORD ACTION */
export async function postChangePassword(prevState: any, formData: FormData) {
  const fullData = {
    oldPassword: formData.get('old_password'),
    newPassword: formData.get('password'),
    confirmPassword: formData.get('confirm_password'),
  };

  let response = await axiosRequest({
    apiEndpoint: API.updatePassword(),
    method: 'PATCH',
    headers: { },
    data: fullData
  });

  return {
    response,
    redirect: `/app/profile?status=successful`,
  };
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