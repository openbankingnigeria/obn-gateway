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
    rcNumber: formData.get('cac'),
    registryLicense: formData.get('regulator_license'),
    certificateOfIncorporation: formData.get('certificate_of_incorporation'),
    taxIdentificationNumber: formData.get('tin'),
    companyStatusReport: formData.get('company_status_report'),
  }; 

  let response = await axiosRequest({
    apiEndpoint: API.updateCompanyDetails(),
    method: 'PATCH',
    headers: { 'Content-Type': 'multipart/form-data', },
    data: fullData
  });

  return { response }
}