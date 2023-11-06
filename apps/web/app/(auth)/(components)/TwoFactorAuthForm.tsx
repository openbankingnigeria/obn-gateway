'use client'

import { post2FAVerification } from '@/actions/authActions';
import { InputElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const TwoFactorAuthForm = () => {
  const [code, setCode] = useState('');

  const incorrect = code?.length !== 6;
  const pathname = usePathname();

  const handleCode = (value: string) => {
    if (value?.length <= 6) {
      setCode(value);
    }
  }

  const initialState = {
    message: null,
    location: pathname
  }

  const [state, formAction] = useFormState(post2FAVerification, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form 
      action={incorrect ? '' : formAction}
      className='flex w-full flex-col gap-[24px]'
    >
      <InputElement 
        name='code'
        type='text'
        placeholder='6-digit authentication code'
        value={code}
        changeValue={(value: string) => handleCode(value)}
        label='Authentication Code'
        required
      />

      <div className='w-full flex-col flex gap-[12px]'>
        <Button 
          type='submit'
          title='Verify'
          disabled={incorrect}
        />

        <LinkButton
          title='Cancel'
          path='/signin'
          outlined
        />
      </div>
    </form>
  )
}

export default TwoFactorAuthForm;