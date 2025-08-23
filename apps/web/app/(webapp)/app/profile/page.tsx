import React from 'react'
import { PersonalDetails, SecurityDetails } from './(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { ToastMessage } from '../../(components)';
import { findPermissionSlug } from '@/utils/findPermissionSlug';
import { RefreshStoredToken } from '@/components/globalComponents';
import { getCookies } from '@/config/cookies';

const ProfilePage = async ({ searchParams }: UrlParamsProps) => {
  const successful = searchParams?.status == 'successful';

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedProfile?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${await getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let profile = fetchedProfile?.data;
  let userPermissions = profile?.user?.role?.permissions

  return (
    <div className='w-full flex-col flex gap-[24px]'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

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