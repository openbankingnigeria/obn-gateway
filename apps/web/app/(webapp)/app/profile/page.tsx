import React from 'react'
import { PersonalDetails, SecurityDetails } from './(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { ToastMessage } from '../../(components)';
import { findPermissionSlug } from '@/utils/findPermissionSlug';

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
  let userPermissions = profile?.user?.role?.permissions

  return (
    <div className='w-full flex-col flex gap-[24px]'>
      {
        /* SSR TOAST ERROR */
        (fetchedProfile?.status != 200 && fetchedProfile?.status != 201) && 
        <ToastMessage 
          message={fetchedProfile?.message} 
        />
      }

      {
        findPermissionSlug(userPermissions, "view-profile") &&
        <PersonalDetails 
          profile={profile}
        />
      }

      {
        (findPermissionSlug(userPermissions, "change-password") ||
        findPermissionSlug(userPermissions, "enable-twofa") ||
        findPermissionSlug(userPermissions, "disable-twofa")) &&
        <SecurityDetails
          profile={profile} 
          successful={successful}
        />
      }
    </div>
  )
}

export default ProfilePage