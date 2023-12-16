'use client'

import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { TwoFactorAuthModalProps } from '@/types/webappTypes/componentsTypes'
import { usePathname } from 'next/navigation'
import React, { FormEvent, useState } from 'react'

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
      // setCode(value?.toString()?.replace(/[^0-9.]/g, ''));
      setCode(value);
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    next(code);
  }

  return (
    <form 
      onSubmit={handleSubmit}
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