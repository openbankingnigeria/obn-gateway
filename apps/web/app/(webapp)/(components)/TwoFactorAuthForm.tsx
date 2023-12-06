'use client'

import { postApp2FAVerification } from '@/actions/consumerActions'
import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { TwoFactorAuthModalProps } from '@/types/webappTypes/componentsTypes'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify'

const TwoFactorAuthForm = ({
  close,
  loading,
  next,
}: TwoFactorAuthModalProps) => {
  const [code, setCode] = useState('');

  const incorrect = code?.length !== 6;
  const pathname = usePathname();

  const handleCode = (value: string) => {
    if (value?.length <= 6 ) {
      setCode(value?.toString()?.replace(/[^0-9.]/g, ''));
    }
  }

  const initialState = {
    message: null,
    location: pathname
  }

  const [state, formAction] = useFormState(postApp2FAVerification, initialState);

  if (state?.message == 'success') {
    next();
  } else {
    toast.error(state?.message);
  }

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

      <div className='flex items-center justify-between gap-5'>
        <Button 
          title='Cancel'
          effect={() => close()}
          outlined
          small
          containerStyle='!w-fit'
        />
        
        <Button 
          title={'Verify'}
          type='submit'
          disabled={loading || incorrect}
          loading={loading}
          small
          containerStyle='!w-[64px]'
        />
      </div>
    </form>
  )
}

export default TwoFactorAuthForm