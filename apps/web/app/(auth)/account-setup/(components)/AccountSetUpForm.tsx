'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { useState } from 'react';
import { postAccountSetUp } from '@/actions/authActions';
import { greaterThan8, validateLowercase, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
import { useServerAction } from '@/hooks';

const AccountSetUpForm = ({
  token
}: { token: string | undefined }) => {
  const [first_name, setFirstName] = useState(''); 
  const [last_name, setLastName] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm_password, setConfirmPassword] = useState(''); 

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirm_password

  const incorrect = (
    !first_name ||
    !last_name ||
    !correctPassword ||
    !passwordMatch
  );

  const handleFirstName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setFirstName(capitalizedValue);
  };

  const handleLastName = (value: string) => {
    const inputValue = value;
    const capitalizedValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
    setLastName(capitalizedValue);
  };

  const initialState = {
    setupToken: token,
  }
  const [state, formAction] = useServerAction(postAccountSetUp, initialState);

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col w-full'
    >
      <div className='w-full flex flex-col gap-[16px]'>
        <div className='flex flex-col mx:flex-row mx:items-end gap-[16px]'>
          <InputElement 
            name='first_name'
            placeholder='First name'
            label='What is your name?'
            value={first_name}
            changeValue={(value: string) => handleFirstName(value)}
            required
          />

          <InputElement 
            name='last_name'
            placeholder='Last name'
            value={last_name}
            changeValue={(value: string) => handleLastName(value)}
            required
          />
        </div>

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
        title='Submit'
        disabled={incorrect}
      />
    </form>
  )
}

export default AccountSetUpForm;