'use client'

import { Button } from '@/components/globalComponents'
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

const PasswordChangedSuccessfully = () => {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.push('/signin')
    }, 2000)

    return () => {
      clearInterval(interval)
    }
  }, [router]);

  return (
    <div className='w-full flex flex-col gap-[24px]'>
      <div className='flex w-full items-center gap-[8px]'>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <mask id="mask0_54_20063" style={{ maskType: 'luminance' }} maskUnits="userSpaceOnUse" x="1" y="1" width="22" height="22">
            <path d="M12 22C13.3135 22.0017 14.6143 21.7438 15.8278 21.2412C17.0413 20.7385 18.1435 20.001 19.071 19.071C20.001 18.1435 20.7385 17.0413 21.2412 15.8278C21.7438 14.6143 22.0017 13.3135 22 12C22.0017 10.6865 21.7438 9.3857 21.2411 8.17222C20.7385 6.95875 20.001 5.85656 19.071 4.92901C18.1435 3.99902 17.0413 3.26151 15.8278 2.75885C14.6143 2.25619 13.3135 1.99831 12 2.00001C10.6865 1.99833 9.3857 2.25623 8.17222 2.75889C6.95875 3.26154 5.85656 3.99904 4.92901 4.92901C3.99904 5.85656 3.26154 6.95875 2.75889 8.17222C2.25623 9.3857 1.99833 10.6865 2.00001 12C1.99831 13.3135 2.25619 14.6143 2.75885 15.8278C3.26151 17.0413 3.99902 18.1435 4.92901 19.071C5.85656 20.001 6.95875 20.7385 8.17222 21.2411C9.3857 21.7438 10.6865 22.0017 12 22Z" fill="white" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M8 12L11 15L17 9" stroke="black" fill='transparent' strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </mask>
          <g mask="url(#mask0_54_20063)">
            <path d="M0 0H24V24H0V0Z" fill="#3FB04B"/>
          </g>
        </svg>

        <div className='text-o-text-dark text-f18 font-[500]'>
          Password Changed Successfully
        </div>
      </div>

      <div className='text-o-text-medium text-f14'>
        You will be logged out and required to sign in with 
        your new password.
      </div>

      <div className='w-full flex justify-end'>
        <Button 
          title='Logging out...'
          type='button'
          disabled
          small
        />
      </div>
    </div>
  )
}

export default PasswordChangedSuccessfully