'use client'

import { post2FAVerification, postSignInWith2FA } from '@/actions/authActions';
import { InputElement } from '@/components/forms';
import { Button, LinkButton } from '@/components/globalComponents';
import { getStorage } from '@/config/webStorage';
import { useServerAction } from '@/hooks';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const TwoFactorAuthForm = () => {
  const [code, setCode] = useState('');
  const email = getStorage('el', true, 'session');
  const password = getStorage('pd', true, 'session');

  const incorrect = code?.length !== 6;
  const pathname = usePathname();

  const handleCode = (value: string) => {
    if (value?.length <= 6 ) {
      setCode(value?.toString()?.replace(/[^0-9.]/g, ''));
      // setCode(value);
    }
  }

  const initialState = {}
  const [state, formAction] = useServerAction(
    pathname?.includes('signin') ? 
      postSignInWith2FA : 
      post2FAVerification, 
    initialState
  );

  return (
    <form 
      action={incorrect ? '' : formAction}
      className='flex w-full flex-col gap-[24px]'
    >
      {
        pathname?.includes('signin') &&
        <>
          <input 
            name='email' 
            value={email} 
            readOnly 
            className='hidden opacity-0' 
          />

          <input 
            name='password' 
            value={password} 
            readOnly 
            className='hidden opacity-0' 
          />
        </>
      }

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