import React from 'react'
import { SearchParamsProps } from '@/types/webappTypes/appTypes'
import { AccountSetUpForm, AccountSetupSuccess } from './(components)'

const AccountSetUpPage = ({ searchParams }: SearchParamsProps) => {
  const successful = searchParams?.status == 'successful';

  return (
    <section className='w-full flex flex-col'>
      {
        successful ? 
          <AccountSetupSuccess />
          :
          <div  className='w-full flex flex-col gap-[24px]'>
            <div className='w-full flex flex-col gap-[12px]'>
              <h2 className='text-o-text-dark text-[28px] font-[600]'>
                Complete Account Setup
              </h2>

              <div className='text-o-text-medium3 text-f14'>
                We need some additional information to setup your account
              </div>
            </div>
            
            <AccountSetUpForm />
          </div>
      }
    </section>
  )
}

export default AccountSetUpPage