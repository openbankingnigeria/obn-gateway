import React from 'react'
import { SignupForm, SignupFullForm } from './(components)'
import Link from 'next/link'

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
        
        {/* <SignupForm /> */}
        <SignupFullForm />

        <div className='text-f14 font-[400] w-full text-o-text-dark'>
          Already have an account?&#160;
          <Link
            href={'/signin'}
            className='text-f14 font-[600] w-fit text-o-light-blue' 
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}

export default SignupPage