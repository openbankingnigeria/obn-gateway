'use client'

import { redirect, useRouter } from 'next/navigation';
import { useEffect } from 'react';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const useServerAction = (
  serverAction: (prevState: any, formData: any) => any,
  initialState: any,
) => {
  const router = useRouter();
  const initial_state = {
    ...initialState
  }

  const [state, formAction] = useFormState(serverAction, initial_state);
  /**NB: state = { response: { data, status, message, request_date } }**/

  useEffect(() => {
    if (state?.response?.status == 200 || state?.response?.status == 201) {
      toast.success(state?.response?.message);
      state?.redirect && redirect(state?.redirect);
      state?.refresh && router.refresh();
    } else {
      !(initialState?.noToast) && toast.error(initialState?.message || state?.response?.message);
    }
  }, [state?.response?.request_date]);
  
  return [state, formAction];
}

export default useServerAction