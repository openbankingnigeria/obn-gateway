'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postInitiatePasswordReset } from '@/actions/authActions';
import { validateEmail } from '@/config/globalValidations';

const ForgetPasswordForm = () => {
  const [email, setEmail] = useState(''); 

  const incorrect = !validateEmail(email);

  const initialState = {
    message: null,
  }

  const storeEmailLocally = () => {
    sessionStorage.setItem('aperta-user-email', email);
  }

  const [state, formAction] = useFormState(postInitiatePasswordReset, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='email'
          placeholder='johndoe@openbanking.com'
          label='Email Address'
          value={email}
          changeValue={setEmail}
          required
        /> 
      </div>

      <Button 
        type='submit'
        title='Reset Password'
        effect={storeEmailLocally}
        disabled={incorrect}
      />
    </form>
  )
}

export default ForgetPasswordForm;