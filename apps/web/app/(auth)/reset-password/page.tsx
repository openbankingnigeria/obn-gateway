import React from 'react'
import { SearchParamsProps } from '@/types/webappTypes/appTypes'
import { ResetPasswordSuccess, ResetPasswordForm } from './(components)'

const ResetPasswordPage = ({ searchParams }: SearchParamsProps) => {
  const successful = searchParams?.status == 'successful';

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
            
            <ResetPasswordForm />
          </div>
      }
    </section>
  )
}

export default ResetPasswordPage