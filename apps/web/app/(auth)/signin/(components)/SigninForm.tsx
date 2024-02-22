'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { validateEmail } from '@/utils/globalValidations';
import Link from 'next/link';
import React, { useState } from 'react';
import { postSignIn } from '@/actions/authActions';
import { useServerAction } from '@/hooks';
import { redirect } from 'next/navigation';
import { setStorage } from '@/config/webStorage';
import { toast } from 'react-toastify';

const SigninForm = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  const incorrect = (
    !validateEmail(email) ||
    !password
  )

  const initialState = { 
    // message: 'Invalid email and password' 
  }
  
  const [state, formAction] = useServerAction(postSignIn, initialState);
  if (state?.response?.status == 412) {
    setStorage('el', email, 'session');
    setStorage('pd', password, 'session');
    redirect('/signin/2fa')
  }

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[24px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='email'
          type='email'
          placeholder='Email address'
          changeValue={setEmail}
          invalid={!!(state?.response?.status == 400)}
          hint={(state?.response?.status == 400) ? 'Incorrect email address' : ''}
          label='Email Address'
          required
        />

        <InputElement 
          name='password'
          type='password'
          invalid={!!(state?.response?.status == 400)}
          hint={(state?.response?.status == 400) ? 'Incorrect password' : ''}
          placeholder='Password'
          changeValue={setPassword}
          label='Password'
          required
        />

        <div className='w-full'>
          <Link
            href='/forget-password'
            className='w-fit text-o-light-blue hover:text-o-dark-blue text-f13 font-[600] cursor-pointer'
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button 
        type='submit'
        title='Sign In'
        disabled={incorrect}
      />
    </form>
  )
}

export default SigninForm;