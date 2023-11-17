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