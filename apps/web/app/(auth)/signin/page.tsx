import React from 'react'
import { SigninForm } from './(components)'

const SigninPage = () => {
  return (
    <section className='w-full flex flex-col'>
      <div  className='w-full flex flex-col gap-[24px]'>
        <div className='w-full flex flex-col gap-[12px]'>
          <h2 className='text-o-text-dark text-[28px] font-[600]'>
            Sign In
          </h2>

          <div className='text-o-text-medium3 text-f14'>
            Sign in to continue to your account
          </div>
        </div>

        <SigninForm />
      </div>
    </section>
  )
}

export default SigninPage