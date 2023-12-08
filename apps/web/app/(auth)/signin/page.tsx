import React from 'react'
import { SigninForm } from './(components)'
import Link from 'next/link'

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

        <div className='text-f14 font-[400] w-full text-o-text-dark'>
          Don&#39;t have an account?&#160;
          <Link
            href={'/signup'}
            className='text-f14 font-[600] w-fit text-o-light-blue' 
          >
            Sign Up
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SigninPage