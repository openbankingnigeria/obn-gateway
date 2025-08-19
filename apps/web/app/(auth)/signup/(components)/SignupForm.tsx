'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { MouseEvent, useEffect, useState } from 'react';
import { greaterThan8, validateEmail, validateLowercase, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
import { useRouter } from 'next/navigation';
import { getStorage, setStorage } from '@/config/webStorage';

const SignupForm = () => {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm_password, setConfirmPassword] = useState(''); 
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const getData = getStorage('sd', true, 'session');

  useEffect(() => {
    setEmail(getData?.email); 
  }, [getData?.email]);

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirm_password

  const incorrect = (
    !validateEmail(email) ||
    !correctPassword ||
    !passwordMatch
  );

  const handleSubmit = (e: MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setStorage(
      'sd', 
      { email, password, confirm_password },
      'session'
    );
    router.push('/signup/personal-details')
    // setLoading(false);
  };

  return (
    <form
      action={''}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <InputElement 
          name='email'
          type='email'
          placeholder='Email address'
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
          placeholder='Password'
          label='Password'
          required
        />

        <InputElement 
          name='confirm_password'
          type='password'
          value={confirm_password}
          changeValue={setConfirmPassword}
          placeholder='Confirm password'
          label='Confirm Password'
          hint={!passwordMatch ? 'Password does not match' : ''}
          invalid={!passwordMatch && !!confirm_password}
          required
        />
      </div>

      <Button 
        type='button'
        effect={(e) => handleSubmit(e)}
        loading={loading}
        title='Create account'
        disabled={loading || incorrect}
      />
    </form>
  )
}

export default SignupForm;