'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { validateEmail } from '@/config/globalValidations';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postSignIn } from '@/actions/authActions';

const SigninForm = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 

  const incorrect = (
    !validateEmail(email) ||
    !password
  )

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postSignIn, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[24px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='email'
          type='email'
          placeholder='johndoe@openbanking.com'
          changeValue={setEmail}
          label='Email Address'
          required
        />

        <InputElement 
          name='password'
          type='password'
          placeholder='● ● ● ● ● ● ● ● ● ● ●'
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
        title='Submit'
        disabled={incorrect}
      />
    </form>
  )
}

export default SigninForm;