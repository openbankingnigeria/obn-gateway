import React from 'react'
import { StatusSearchParamsProps } from '@/types/appTypes'
import { CheckEmailPage, ForgetPasswordForm } from './(components)';

const ForgetPasswordPage = ({ searchParams }: StatusSearchParamsProps) => {
  const successful = searchParams?.status == 'successful';

  return (
    <section className='w-full flex flex-col'>
      {
        successful ? 
          <CheckEmailPage />
          :
          <div  className='w-full flex flex-col gap-[24px]'>
            <div className='w-full flex flex-col gap-[16px]'>
              <h2 className='text-o-text-dark text-[28px] font-[600]'>
                Forgot Password?
              </h2>

              <div className='text-o-text-medium3 text-f14'>
                Please enter your associated email address and we’ll send you instructions that’ll allow you reset your password.
              </div>
            </div>
            
            <ForgetPasswordForm />
          </div>
      }
    </section>
  )
}

export default ForgetPasswordPage