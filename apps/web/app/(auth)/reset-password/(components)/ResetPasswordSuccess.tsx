'use client'

import { LinkButton } from '@/components/globalComponents'
import React, { useEffect } from 'react'

const ResetPasswordSuccess = () => {

  useEffect(() => {
    localStorage.removeItem('aperta-user-resetToken');
  }, []);

  return (
    <div className='w-full flex flex-col gap-[24px]'>
      <svg width="64" height="65" viewBox="0 0 64 65" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_147_12389)">
          <path fillRule="evenodd" clipRule="evenodd" d="M31.9926 64.7131C14.3649 64.7131 0 50.3482 0 32.7058C0 15.0633 14.3649 0.713135 31.9926 0.713135C49.6351 0.713135 64 15.0633 64 32.7058C64 50.3482 49.6351 64.7131 31.9926 64.7131Z" fill="#59C06F"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M31.9927 60.7123C16.5648 60.7123 4.00098 48.1485 4.00098 32.7058C4.00098 17.2779 16.5648 4.71411 31.9927 4.71411C47.4353 4.71411 59.9991 17.2779 59.9991 32.7058C59.9991 48.1485 47.4353 60.7123 31.9927 60.7123Z" fill="#41AA57"/>
          <path fillRule="evenodd" clipRule="evenodd" d="M27.2682 45.801C26.9729 45.801 26.6924 45.6976 26.5005 45.491L16.4612 35.4517C16.0331 35.0236 16.0331 34.3445 16.4612 33.9163L20.9641 29.4134C21.3775 28.9853 22.0714 28.9853 22.4995 29.4134L27.2682 34.1821L41.5002 19.9352C41.9284 19.5071 42.6223 19.5071 43.0356 19.9352L47.5385 24.4381C47.9667 24.8663 47.9667 25.5454 47.5385 25.9735L28.0359 45.491C27.8292 45.6976 27.5487 45.801 27.2682 45.801Z" fill="#9FF5B4"/>
        </g>
        <defs>
          <clipPath id="clip0_147_12389">
            <rect width="64" height="64" fill="white" transform="translate(0 0.713135)"/>
          </clipPath>
        </defs>
      </svg>

      <div className='w-full flex flex-col gap-[16px]'>
        <h2 className='text-o-text-dark text-[28px] font-[600]'>
          Password Changed
        </h2>

        <div className='text-o-text-medium3 text-f14'>
          You’ve successfully changed your account password
        </div>
      </div>

      <LinkButton 
        title='Sign In'
        path='/signin'
      />
    </div>
  )
}

export default ResetPasswordSuccess