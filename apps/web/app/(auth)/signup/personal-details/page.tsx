import React from 'react'
import { PersonalDetailsForm } from '../(components)'
import Link from 'next/link'

const PersonalDetailsPage = () => {
  /* API CONSUMER */
  return (
    <section className='w-full flex flex-col'>
      <div  className='w-full flex flex-col gap-[24px]'>
        <div className='w-full'>
          <Link 
            href='/signup'
            className='cursor-pointer gap-[6px] flex items-center w-fit text-f14 font-[600] text-o-light-blue'
          >
            <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.3334 10.7131H4.66669M4.66669 10.7131L10.5 16.5465M4.66669 10.7131L10.5 4.87979" stroke="#5277C7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent' />
            </svg>

            Back
          </Link>
        </div>

        <div className='w-full flex flex-col gap-[12px]'>
          <h2 className='text-o-text-dark text-[28px] font-[600]'>
            Your personal details
          </h2>

          <div className='text-o-text-medium3 text-f14'>
            Please provide details about yourself, it’ll be used to setup your profile
          </div>
        </div>
        
        <PersonalDetailsForm />
      </div>
    </section>
  )
}

export default PersonalDetailsPage