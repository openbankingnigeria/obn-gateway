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
    setCookies('aperta-user-accessToken', response?.data?.accessToken);
    setCookies('aperta-user-refreshToken', response?.data?.refreshToken);
    setCookies('aperta-user-tokenType', response?.data?.tokenType);
    setCookies('aperta-user-expiresIn', response?.data?.expiresIn);
  }

  return {
    response,
    redirect: `/app/home/dashboard`,
  };
}

/* SIGNIN WITH 2FA ACTION */
export async function postSignInWith2FA(prevState: any, formData: FormData) {
  const fullData = {
    email: formData.get('email'),
    password: formData.get('password'),
    code: formData.get('code'),
  }

  let response = await axiosRequest({
    apiEndpoint: API.postLoginWith2FA(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  if (response?.data) {
    setCookies('aperta-user-accessToken', response?.data?.accessToken);
  }

  return {
    response,
    redirect: `/app/home/dashboard`,
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
      token: prevState?.setupToken
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
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    // country: formData.get('country'),
    companyType: formData.get('userType'),
    companyName: formData.get('companyName'),
    companySubtype: formData.get('companySubtype'),
    bvn: formData.get('bvn'),
    rcNumber: formData.get('rcNumber'),
    accountNumber: formData.get('accountNumber'),
    // companyRole: formData.get('role'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  let response = await axiosRequest({
    apiEndpoint: API.postSignup(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  return {
    response,
    // redirect: `/signup?status=successful`
    redirect: `/signup/verify-email`,
  };
}


/* VERIFIY EMAIL ACTION */
export async function postVerifyEmail(prevState: any, formData: FormData) {
  const fullData = {
    otp: formData.get('code'),
    email: formData.get('email'),
  };

  // console.log(fullData)
  
  let response = await axiosRequest({
    apiEndpoint: API.postVerfiyEmail(),
    method: 'POST',
    headers: { },
    data: fullData
  });

  return {
    response,
    redirect: `/signup/verify-email?status=successful`,
  };
};


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
      token: prevState?.resetToken
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
  deleteCookies('aperta-user-profile');
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

/** BACKUP CODE VERIFICATION ACTION */
export async function postBackupCodeVerification(prevState: any, formData: FormData) {
  const fullData = {
    code: formData.get('code'),
  }

  prevState?.location?.includes('reset-password') ?
    redirect(`/reset-password?status=successful`) :
    redirect(`/app/home/dashboard`);
}