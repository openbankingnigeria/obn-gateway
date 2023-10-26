'use client'

import { Button } from '@/components/globalComponents'
import Image from 'next/image'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import Link from 'next/link'
import React from 'react'
import { postReInitiatePasswordReset } from '@/actions/authActions'
import { toast } from 'react-toastify'
import { InputElement } from '@/components/forms'

const CheckEmailPage = () => {
  const email = sessionStorage.getItem('aperta-user-email') || '';

  const openEmailInbox = () => {
    const mailtoLink = `mailto:${email}`;
    window.location.href = mailtoLink;
  };

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postReInitiatePasswordReset, initialState);
  state?.message && toast.error(state?.message);

  return (
    <form 
      action={formAction}
      className='w-full flex flex-col gap-[16px]'
    >
      <div className='w-full flex justify-between items-start gap-[16px]'>
        <Image 
          src='/icons/email_icon.svg'
          alt='email_icon'
          loading='lazy'
          width={40}
          height={40}
          className='object-cover'
        />

        <Link
          href='/signin'
          className='cursor-pointer text-f14 font-[500] text-o-dark-green'
        >
          Go to Sign In
        </Link>
      </div>

      <div className='w-full flex flex-col gap-[16px]'>
        <h2 className='text-o-text-dark text-[28px] font-[600]'>
          Check Your Email
        </h2>

        <div className='text-o-text-medium3 text-f14'>
          We just sent an email to&#160;
          <span className='font-[600]'>
            {email}
          </span>&#160;
          with a link to reset your password.
        </div>
      </div>

        <InputElement
          name='email'
          placeholder='johndoe@openbanking.com'
          label='Email Address'
          value={email}
          containerStyle='hidden'
          required
        /> 

      <div className='w-full flex-col flex gap-[12px]'>
        <Button 
          type='button'
          title='Open Email Inbox'
          effect={openEmailInbox}
        />

        <Button
          type='submit'
          title='Resend Email'
          outlined
        />
      </div>
    </form>
  )
}

export default CheckEmailPage