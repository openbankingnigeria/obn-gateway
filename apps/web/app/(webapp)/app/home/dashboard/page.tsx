import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { APIConsumerDashboardPage, APIProviderDashboardPage } from './(components)'
import { getUserBootstrapData } from '@/server/getUserBootstrapData'

const DashboardPage = async ({ searchParams }: UrlParamsProps) => {
  const date_filter = searchParams?.date_filter || '';

  const bootstrap = await getUserBootstrapData();

  if (bootstrap.shouldLogout) {
    return null;
  }

  const profile = bootstrap.profile;
  const companyDetails = bootstrap.companyDetails;
  
  return (
    <>
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