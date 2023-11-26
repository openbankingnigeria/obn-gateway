// @ts-nocheck
'use server'

import { axiosRequest } from '@/config/axiosRequest';
import * as API from '../config/endpoints';
import { redirect } from 'next/navigation';
import { deleteCookies, setCookies } from '@/config/cookies';

/* SIGNIN ACTION */
export async function postSignIn(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  let response = await axiosRequest({
    apiEndpoint: API.postLogin(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  if (response?.data) {
    setCookies('aperta-user-accessToken', response?.data);
  }

  return {
    response,
    redirect: `/app/home/dashboard`,
    // redirect: `/signin/2fa`,
  };
}

/* ACCOUNT SETUP ACTION */
export async function postAccountSetUp(prevState: any, formData: FormData) {
  const fullData = {
    firstName: formData.get('first_name'),
    lastName: formData.get('last_name'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirm_password'),
  };

  let response = await axiosRequest({
    apiEndpoint: API.postAccountSetUp({
      setupToken: prevState?.setupToken
    }),
    method: 'POST',
    headers: { },
    data: fullData
  });

  return { 
    response,
    redirect: `/account-setup?status=successful`,
  };
}

/* SIGN UP ACTION */
export async function postSignup(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirm_password'),
    firstName: formData.get('first_name'),
    lastName: formData.get('last_name'),
    country: formData.get('country'),
    phone: formData.get('phone_number'),
    companyName: formData.get('company_name'),
    companyType: formData.get('company_type'),
    companyRole: formData.get('role'),
  };

  let response = await axiosRequest({
    apiEndpoint: API.postSignup(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  return {
    response,
    redirect: `/signup/company-details?status=successful`,
  };
}

/* INITIATE PASSWORD RESET ACTION */
export async function postInitiatePasswordReset(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
  };

  let response = await axiosRequest({
    apiEndpoint: API.postInitiatePasswordReset(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  response?.data && 
  setCookies('aperta-user-resetToken', response?.data);

  return {
    response,
    redirect: `/forget-password?status=successful`,
  };
}

/* REINITIATE PASSWORD RESET ACTION */
export async function postReInitiatePasswordReset(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
  }

  let response = await axiosRequest({
    apiEndpoint: API.postInitiatePasswordReset(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  response?.data && 
  setCookies('aperta-user-resetToken', response?.data);

  return { response };
}

/* RESET PASSWORD ACTION */
export async function postResetPassword(prevState: any, formData: FormData) {
  const fullData = {
    password: formData.get('password'),
    confirmPassword: formData.get('confirm_password'),
  }

  let response = await axiosRequest({
    apiEndpoint: API.postResetPassword({
      resetToken: prevState?.resetToken
    }),
    method: 'POST',
    headers: { },
    data: fullData
  });

  deleteCookies('aperta-user-resetToken');

  return { 
    response,
    redirect: `/reset-password?status=successful`,
    // redirect: `/reset-password/2fa`,
  };
}

/* LOGOUT ACTION */
export async function logOutAction(prevState: any, formData: FormData) {
  deleteCookies('aperta-user-accessToken');
  redirect('/');
}

/* 2FA VERIFICATION ACTION */
export async function post2FAVerification(prevState: any, formData: FormData) {
  const fullData = {
    code: formData.get('code'),
  }

  prevState?.location?.includes('reset-password') ?
    redirect(`/reset-password?status=successful`) :
    redirect(`/app/home/dashboard`);
}