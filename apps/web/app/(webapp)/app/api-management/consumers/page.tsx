import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ToastMessage, TopPanel } from '@/app/(webapp)/(components)'
import { CONSUMERS_TABLE_DATA, CONSUMERS_TABLE_HEADERS, CONSUMERS_TOP_STATUS_DATA, CONSUMERS_KYB_STATUS_DATA, CONSUMERS_STATUS_DATA } from '@/data/consumerData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ConsumersTable } from './(components)'
import { APIS_DATA } from '@/data/apisData'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import { RefreshStoredToken } from '@/components/globalComponents'
import { getCookies } from '@/config/cookies'

const ConsumersPage = async({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const kybStatus = searchParams?.kybStatus || ''
  const search_apis = searchParams?.search_apis || ''

  const filters = [status, search_query];

  const fetchedConsumers: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanies({
      page: `${page}`,
      limit: `${rows}`,
      kybStatus: kybStatus,
      name: search_query,
      status: status
    }),
    method: 'GET',
    data: null
  });
  
  const fetchedStats: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyStat(),
    method: 'GET',
    data: null
  });

  const fetchedKybStats: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyKybStat(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedConsumers?.status == 401) {
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

  let meta_data = fetchedConsumers?.meta_data;
  let stats = fetchedStats?.data;
  let kybStats = fetchedKybStats?.data;
  let consumers = fetchedConsumers?.data?.map((consumer: any) => {
    return({
      ...consumer,
      user_type: consumer?.type,
      business_name: consumer?.name || 'N/A',
      name: consumer?.primaryUser?.profile?.firstName ? 
        `${consumer?.primaryUser?.profile?.firstName} 
        ${consumer?.primaryUser?.profile?.lastName}` :
        null,
      email_address: consumer?.primaryUser?.email,
      kyb_status: consumer?.kybStatus,
      status: consumer?.status
    })
  });

  // TODO: STATS REQUIRED DATE FILTER (SHOULD BE REMOVED)
  const panel = CONSUMERS_TOP_STATUS_DATA({
    all: stats?.reduce((acc: any, obj: any) => acc + Number(obj.count), 0), 
    pending: kybStats?.find((stat: any) => stat?.value == 'pending')?.count,
    approved: kybStats?.find((stat: any) => stat?.value == 'approved')?.count, 
    // active: stats?.find((stat: any) => stat?.value == 'active')?.count, 
    // inactive: stats?.find((stat: any) => stat?.value == 'inactive')?.count, 
    denied: kybStats?.find((stat: any) => stat?.value == 'denied')?.count,
  });

  const headers = CONSUMERS_TABLE_HEADERS;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = consumers?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  const data_list = APIS_DATA;

  const status_list = CONSUMERS_STATUS_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  })

  const kyb_status_list = CONSUMERS_KYB_STATUS_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  })


  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedConsumers?.status != 200 && fetchedConsumers?.status != 201) && 
        <ToastMessage 
          message={fetchedConsumers?.message} 
        />
      }

      <TopPanel 
        name='kybStatus'
        panel={panel}
        currentValue={kybStatus}
      />

      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Consumers
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex-wrap flex items-center gap-[12px]'>
            <SearchBar 
              placeholder='Search consumers'
              searchQuery={search_query}
            />

            <SelectElement 
              name='status'
              options={status_list}
              value={status}
              innerLabel='Status:'
              containerStyle='!w-fit cursor-pointer'
              small
              removeSearch
              optionStyle='!top-[38px]'
              forFilter
            />

            <SelectElement 
              name='kybStatus'
              options={kyb_status_list}
              value={kybStatus}
              innerLabel='KYB Status:'
              containerStyle='!w-fit cursor-pointer'
              small
              removeSearch
              optionStyle='!top-[38px]'
              forFilter
            />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <ConsumersTable 
              tableHeaders={headers}
              rawData={consumers}
              altData={stats}
              filters={filters}
              rows={rows}
              totalElementsInPage={total_elements_in_page}
              page={page}
              searchQuery={search_apis}
              totalElements={total_elements}
              totalPages={total_pages}
              dataList={data_list}
            />
          </section>
        </section>
      </div>
    </section>
  )
}

export default ConsumersPage