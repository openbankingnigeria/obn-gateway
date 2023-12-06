import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { APIConsumerDashboardPage, APIProviderDashboardPage } from './(components)'
import { getCookies } from '@/config/cookies';

const DashboardPage = ({ searchParams }: UrlParamsProps) => {
  const date_filter = searchParams?.date_filter || '';
  const search_query = searchParams?.search_query || '';
  const request_method = searchParams?.request_method || '';
  const tier = searchParams?.tier || '';
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const getUserProfile = getCookies('aperta-user-profile');
  const userProfile = getUserProfile ? JSON.parse(getUserProfile) : null;
  const userType = userProfile?.userType;
  
  return (
    userType == 'api-provider' ?
      <APIProviderDashboardPage
        date_filter={date_filter}
      />
      :
      <APIConsumerDashboardPage 
        search_query={search_query}
        request_method={request_method}
        tier={tier}
        rows={rows}
        page={page}
      />
  )
}

export default DashboardPage