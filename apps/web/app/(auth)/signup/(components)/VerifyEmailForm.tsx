'use client'

import { postVerifyEmail } from '@/actions/authActions';
import { InputElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
import { getStorage } from '@/config/webStorage';
import { useServerAction } from '@/hooks';
import React, { useState } from 'react';

const VerifyEmailForm = () => {
  const [code, setCode] = useState('');
  const email = getStorage('el', true, 'session');

  const incorrect = code?.length !== 6;

  const handleCode = (value: string) => {
    if (value?.length <= 6 ) {
      setCode(value?.toString()?.replace(/[^0-9.]/g, ''));
      // setCode(value);
    }
  }

  const initialState = {}
  const [state, formAction] = useServerAction(
    postVerifyEmail, 
    initialState
  );

  return (
    <div className='w-full flex flex-col gap-[24px]'>
      <div className='text-o-text-medium3 text-f14'>
        Enter the 6-digit verification code we sent to {email || '---'}.
      </div>
      
      <form 
        action={incorrect ? '' : formAction}
        className='flex w-full flex-col gap-[24px]'
      >
        <>
          <input 
            name='email' 
            value={email} 
            readOnly 
            className='hidden opacity-0' 
          />
        </>

        <InputElement 
          name='code'
          type='text'
          placeholder='6-digit verification code'
          value={code}
          changeValue={(value: string) => handleCode(value)}
          label='Verification code'
          required
        />

        <div className='w-full flex-col flex gap-[12px]'>
          <Button 
            type='submit'
            title='Verify'
            disabled={incorrect}
          />

          {/* <LinkButton
            title='Back'
            path='/signup'
            outlined
          /> */}
        </div>
      </form>
    </div>
  )
}

export default VerifyEmailForm