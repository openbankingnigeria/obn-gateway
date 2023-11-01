import React from 'react'
import { PersonalDetails, SecurityDetails } from './(components)'
import { SearchParamsProps } from '@/types/webappTypes/appTypes'

const ProfilePage = ({ searchParams }: SearchParamsProps) => {
  const successful = searchParams?.status == 'successful';

  return (
    <div className='w-full flex-col flex gap-[24px]'>
      <PersonalDetails />
      <SecurityDetails 
        successful={successful}
      />
    </div>
  )
}

export default ProfilePage