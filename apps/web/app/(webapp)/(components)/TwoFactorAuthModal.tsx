import { TwoFactorAuthModalProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'
import { TwoFactorAuthForm } from '.'

const TwoFactorAuthModal = ({
  close,
  loading,
  next,
}: TwoFactorAuthModalProps) => {
  return (
    <section className='flex flex-col gap-[16px] w-full'>
      <div className='w-full flex flex-col'>
        <div className='text-o-text-medium3 text-f14'>
          You have two-factor authentication set up on your account for added security. 
          <br /><br />
          Enter the six-digit code from your authenticator app on your registered mobile device.
        </div>
      </div>

      <TwoFactorAuthForm 
        close={close}
        loading={loading}
        next={next}
      />
    </section>
  )
}

export default TwoFactorAuthModal