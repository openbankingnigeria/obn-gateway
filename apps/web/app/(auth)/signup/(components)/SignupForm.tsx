'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { postCreateAccount } from '@/actions/authActions';
import { greaterThan8, validateLowercase, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';

const SignupForm = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm_password, setConfirmPassword] = useState(''); 

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirm_password

  const incorrect = (
    !email ||
    !correctPassword ||
    !passwordMatch
  );

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postCreateAccount, initialState);
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
          label='Company Email Address'
          value={email}
          changeValue={setEmail}
          required
        />

        <InputElement 
          name='password'
          type='password'
          value={password}
          changeValue={setPassword}
          showGuide
          placeholder='● ● ● ● ● ● ● ● ● ● ●'
          label='Password'
          required
        />

        <InputElement 
          name='confirm_password'
          type='password'
          value={confirm_password}
          changeValue={setConfirmPassword}
          placeholder='● ● ● ● ● ● ● ● ● ● ●'
          label='Confirm Password'
          hint={!passwordMatch ? 'Password does not match' : ''}
          invalid={!passwordMatch && !!confirm_password}
          required
        />
      </div>

      <Button 
        type='submit'
        title='Create account'
        disabled={incorrect}
      />
    </form>
  )
}

export default SignupForm;