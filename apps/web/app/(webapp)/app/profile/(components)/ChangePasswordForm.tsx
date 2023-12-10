'use client'

import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import React, { MouseEventHandler, useState } from 'react';
import { useServerAction } from '@/hooks';
import { greaterThan8, validateLowercase, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
import { postChangePassword } from '@/actions/profileActions';

const ChangePasswordForm = ({
  close
}: { close: MouseEventHandler<HTMLButtonElement> }) => {
  const [old_password, setOldPassword] = useState(''); 
  const [password, setPassword] = useState(''); 
  const [confirm_password, setConfirmPassword] = useState(''); 

  const upperAndLowerCase = validateUppercase(password) && validateLowercase(password);
  const number = validateNumber(password);
  const symbol = validateSymbol(password);
  const passwordLength = greaterThan8(password);

  const correctPassword = (upperAndLowerCase && number && symbol && passwordLength);
  const passwordMatch = password === confirm_password

  const incorrect = (
    !old_password ||
    !correctPassword ||
    !passwordMatch
  );

  const initialState = {}
  const [state, formAction] = useServerAction(postChangePassword, initialState);
  
  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='px-[20px] w-full h-[calc(100%-50px)] overflow-auto flex flex-col gap-[16px]'>
        <InputElement 
          name='old_password'
          type='password'
          value={old_password}
          changeValue={setOldPassword}
          placeholder='Old password'
          label='Old Password'
          required
        />

        <InputElement 
          name='password'
          type='password'
          value={password}
          changeValue={setPassword}
          showGuide
          placeholder='Password'
          label='New Password'
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

      <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button 
          type='submit'
          title='Change Password'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default ChangePasswordForm;