import React from 'react'
import Link from 'next/link'
import { BackupCodeForm } from '../(components)'

const BackupCodePage = () => {
  return (
    <section className='w-full flex flex-col gap-[32px]'>
      <h2 className='text-o-text-dark text-f28 font-[600]'>
        Sign In
      </h2>
      
      <div className='w-full flex flex-col gap-[32px]'>
        <div className='flex w-full flex-col gap-[24px]'>
          <div className='flex w-full flex-col gap-[12px]'>
            <h3 className='text-o-text-dark text-f18 font-[500]'>
              Two-Factor Authentication
            </h3>
            <div className='text-o-text-medium3 text-f14'>
              Enter one of your 6-digit backup codes. 
              Once you use a backup code to sign in, 
              that code becomes inactive.
            </div>
          </div>

          <BackupCodeForm />
        </div>

        <Link
          href={'/signin/2fa'}
          className='text-f13 font-[600] w-fit text-o-light-blue' 
        >
          Use authentication code
        </Link>
      </div>
    </section>
  )
}

export default BackupCodePage