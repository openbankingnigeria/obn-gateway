import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ResetPasswordSuccess, ResetPasswordForm } from './(components)'

const ResetPasswordPage = ({ searchParams }: UrlParamsProps) => {
  const successful = searchParams?.status == 'successful';
  const token = searchParams?.token;

  return (
    <section className='w-full flex flex-col'>
      {
        successful ? 
          <ResetPasswordSuccess />
          :
          <div  className='w-full flex flex-col gap-[24px]'>
            <h2 className='text-o-text-dark text-[28px] font-[600]'>
              Reset Your Password
            </h2>
            
            <ResetPasswordForm 
              token={token}
            />
          </div>
      }
    </section>
  )
}

export default ResetPasswordPage