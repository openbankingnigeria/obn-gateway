import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { APIConsumerDashboardPage, APIProviderDashboardPage } from './(components)'
import { getCookies } from '@/config/cookies';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { RefreshStoredToken } from '@/components/globalComponents';

const DashboardPage = async ({ searchParams }: UrlParamsProps) => {
  const date_filter = searchParams?.date_filter || '';
  // const search_query = searchParams?.search_query || '';
  // const request_method = searchParams?.request_method || '';
  // const tier = searchParams?.tier || '';
  // const rows = Number(searchParams?.rows) || 10
  // const page = Number(searchParams?.page) || 1

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const fetchedDetails: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
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
        refreshToken: `${getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  let profile = fetchedProfile?.data;
  let companyDetails = fetchedDetails?.data;

  // const getUserProfile = getCookies('aperta-user-profile');
  // const userProfile = getUserProfile ? JSON.parse(getUserProfile) : null;
  // const userType = userProfile?.userType;
  
  return (
    <>
    {/* REFRESH TOKEN SECTION */}
    {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }
    
    {
      // userType == 'api-provider' ?
      (profile?.user?.role?.parent?.slug == 'api-provider') ?
        <APIProviderDashboardPage
          date_filter={date_filter}
          details_data={companyDetails}
          alt_data={profile}
        />
        :
        <APIConsumerDashboardPage 
          alt_data={companyDetails}
          profile_data={profile}
        />
        // <APIConsumerDashboardPage 
        //   search_query={search_query}
        //   alt_data={profile}
        //   request_method={request_method}
        //   tier={tier}
        //   rows={rows}
        //   page={page}
        // />
    }
    </>
  )
}

export default DashboardPage