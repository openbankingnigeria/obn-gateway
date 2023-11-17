'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { useState } from 'react';
import { postInitiatePasswordReset } from '@/actions/authActions';
import { validateEmail } from '@/utils/globalValidations';
import { useServerAction } from '@/hooks';

const ForgetPasswordForm = () => {
  const [email, setEmail] = useState(''); 

  const incorrect = !validateEmail(email);

  const storeEmailLocally = () => {
    sessionStorage.setItem('aperta-user-email', email);
  }

  const initialState = {}
  const [state, formAction] = useServerAction(postInitiatePasswordReset, initialState);
  state?.response?.data && 
    localStorage?.setItem(
      'aperta-user-resetToken', 
      state?.response?.data
    );
    
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