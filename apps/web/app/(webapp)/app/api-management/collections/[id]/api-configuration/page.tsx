import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { DownStreamForm, EnabledToggle, TransformationForm, UpstreamForm } from '../../(components)';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { StatusBox, ToastMessage } from '@/app/(webapp)/(components)';
import { ToggleSwitch } from '@/components/forms';
import { getCookies } from '@/config/cookies';
import { findPermissionSlug } from '@/utils/findPermissionSlug';
import { RefreshStoredToken } from '@/components/globalComponents';

const APIConfigurationPage = async({ params, searchParams }: UrlParamsProps) => {
  const api_id = searchParams?.api_id || '';
  const preview = searchParams?.preview || '';
  const environment = await getCookies('environment');

  const fetchedAPI: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPI({
      environment: environment || 'development',
      id: api_id
    }),
    method: 'GET',
    data: null
  })

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedAPI?.status == 401) {
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

  let apiDetails = fetchedAPI?.data;
  let profile = fetchedProfile?.data;
  const userType = profile?.user?.role?.parent?.slug;
  let userPermissions = profile?.user?.role?.permissions;
  let viewTransformation = findPermissionSlug(userPermissions, 'view-api-transformation');
  let setTransformation = findPermissionSlug(userPermissions, 'set-api-transformation');

  return (
    <section className='w-full gap-[20px] flex flex-col h-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedAPI?.status != 200 && fetchedAPI?.status != 201) && 
        <ToastMessage 
          message={fetchedAPI?.message} 
        />
      }
      <div className='w-full flex items-center justify-between'>
        <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
          {
            preview == 'true' ?
              'API' :
              'API Configuration'
          }
        </h3>

        {
          preview == 'true' ?
            <StatusBox 
              status={apiDetails?.enabled ? 'enabled' : 'disabled'} 
            />
            :
            <EnabledToggle
              profileData={profile}
              rawData={apiDetails}
            />
        }
      </div>

      <DownStreamForm 
        rawData={apiDetails}
        profileData={userType}
      />

      {
        !(userType == 'api-consumer') && 
        <UpstreamForm 
            rawData={apiDetails}
            profileData={profile}
            preview={preview}
          />
      }
          
      
      {
        ((preview == 'true' && viewTransformation) || (!preview && setTransformation)) &&
        <TransformationForm 
          rawData={apiDetails}
          profileData={profile}
          preview={preview}
        />
      }
    </section>
  )
}

export default APIConfigurationPage