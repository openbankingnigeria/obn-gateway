'use client'

import { getStorage, removeStorage } from '@/config/webStorage';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const useServerAction = (
  serverAction: (prevState: any, formData: any) => any,
  initialState: any,
) => {

  const token = getStorage('aperta-user-accessToken');
  const initial_state = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    ...initialState
  }

  const [state, formAction] = useFormState(serverAction, initial_state);

  useEffect(() => {
    if (state?.response?.status == 200 || state?.response?.status == 201) {
      toast.success(state?.response?.message);
      state?.redirect && redirect(state?.redirect);
    } else if ([403, 401]?.includes(state?.response?.status)) {
      toast.error(state?.response?.message);
      (typeof window !== 'undefined') && 
      removeStorage('aperta-user-accessToken');
      redirect('/');
    } else {
      toast.error(state?.response?.message);
    }
  }, [state?.response?.request_date]);
  
  return [state, formAction];
}

export default useServerAction