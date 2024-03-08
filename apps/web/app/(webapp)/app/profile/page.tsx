import React from 'react'
import { PersonalDetails, SecurityDetails } from './(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { ToastMessage } from '../../(components)';

const ProfilePage = async ({ searchParams }: UrlParamsProps) => {
  const successful = searchParams?.status == 'successful';

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  if (fetchedProfile?.status == 401) {
    return <Logout />
  }

  let profile = fetchedProfile?.data;

  return (
    <div className='w-full flex-col flex gap-[24px]'>
      {
        /* SSR TOAST ERROR */
        (fetchedProfile?.status != 200 && fetchedProfile?.status != 201) && 
        <ToastMessage 
          message={fetchedProfile?.message} 
        />
      }
      <PersonalDetails 
        profile={profile}
      />
      <SecurityDetails
        profile={profile} 
        successful={successful}
      />
    </div>
  )
}

export default ProfilePage