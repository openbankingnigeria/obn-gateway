import React from 'react'
import { SignupForm } from './(components)'

const SignupPage = () => {
  /* API CONSUMER */
  return (
    <section className='w-full flex flex-col'>
      <div  className='w-full flex flex-col gap-[24px]'>
        <div className='w-full flex flex-col gap-[12px]'>
          <h2 className='text-o-text-dark text-[28px] font-[600]'>
            Get started
          </h2>

          <div className='text-o-text-medium3 text-f14'>
            We need some additional information to setup your account
          </div>
        </div>
        
        <SignupForm />
      </div>
    </section>
  )
}

export default SignupPage