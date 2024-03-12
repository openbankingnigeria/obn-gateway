import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ACTIVITY_TABLE_HEADERS, ACTIVITY_TABLE_DATA, ACTIVITY_STATUS_DATA, ACTIVITY_TABLE_CONSUMER_HEADERS } from '@/data/activityData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ActivityTable } from './(components)'
import { APIS_DATA_WITH_ALL } from '@/data/apisData'
import { DatePicker, ExportButton, ToastMessage } from '@/app/(webapp)/(components)'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import moment from 'moment'
import { getCookies } from '@/config/cookies'
import { RefreshStoredToken } from '@/components/globalComponents'

const ActivityPage = async({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const search_apis = searchParams?.search_apis || '';
  const date_filter = searchParams?.date_filter || ''
  const environment = getCookies('environment');

  const dateFilter = date_filter ? JSON.parse(date_filter) : {};
  const filters = [status, search_query, search_apis, dateFilter];

  const fetchedActivities: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPILogs({
      page: `${page}`,
      limit: `${rows}`,
      referenceId: search_query,
      status: status,
      apiId: search_apis,
      createdAt_gt: dateFilter?.start_date ? moment(dateFilter?.start_date).startOf('day').format()?.split('+')[0] + '.000Z' : '',
      createdAt_l: dateFilter?.end_date ? moment(dateFilter?.end_date).endOf('day').format()?.split('+')[0] + '.000Z' : '',
      environment: environment || 'development'
    }),
    method: 'GET',
    data: null
  });

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

 
  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedActivities?.status == 401) {
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

  let meta_data = fetchedActivities?.meta_data;
  let profile = fetchedProfile?.data;
  const rawActivity = fetchedActivities?.data;
  let activity = search_query ? 
    [
      {
        ...rawActivity,
        reference_id: rawActivity?.id,
        consumer_name: rawActivity?.company?.name,
        email_address: rawActivity?.email_address,
        api_name: rawActivity?.name,
        status_code: rawActivity?.response?.status,
        endpoint_url: rawActivity?.request?.url,
        timestamp: rawActivity?.timestamp,
      }
    ] : 
    rawActivity?.map((activity: any) => {
      return({
        ...activity,
        reference_id: activity?.id,
        consumer_name: activity?.company?.name,
        email_address: activity?.email_address,
        api_name: activity?.name,
        status_code: activity?.response?.status,
        endpoint_url: activity?.request?.url,
        timestamp: activity?.timestamp,
      })
    })

  const userType = profile?.user?.role?.parent?.slug;
  const headers = (
    userType == 'api-consumer' ?
      ACTIVITY_TABLE_CONSUMER_HEADERS :
      ACTIVITY_TABLE_HEADERS
  );
  // const activity = ACTIVITY_TABLE_DATA;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = activity?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  const fetchedAPIs: any = 
    userType == 'api-consumer' ?
      await applyAxiosRequest({
        headers: {},
        apiEndpoint: API.getAPIsForCompany({
          environment: environment || 'development'
        }),
        method: 'GET',
        data: null
      })
      :
      await applyAxiosRequest({
        headers: {},
        apiEndpoint: API.getAPIs({
          page: `1`,
          limit: `1000`,
          environment: environment || 'development'
        }),
        method: 'GET',
        data: null
      });

  const status_list = ACTIVITY_STATUS_DATA?.map(data => {
    return({
      label: data?.label,
      value: data?.value
    })
  });

  const initial_api_list = [{
    label: 'All',
    value: ''
  }]

  const api_list = fetchedAPIs?.data?.map((data: any) => {
    return({
      label: data?.name,
      value: data?.id
    })
  });

  return (
    <section className='flex flex-col h-full  w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedActivities?.status != 200 && fetchedActivities?.status != 201) && 
        <ToastMessage 
          message={fetchedActivities?.message} 
        />
      }
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Activity
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-start justify-between gap-[12px]'>
            <div className='w-fit flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search reference'
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
                name='search_apis'
                options={initial_api_list?.concat(api_list)}
                value={search_apis}
                innerLabel='API Name:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              <DatePicker 
                showShortcuts={true}
                name='date_filter'
                dateFilter={date_filter}
              />
            </div>

            <ExportButton 
              module='activity'
            />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <ActivityTable 
              tableHeaders={headers}
              rawData={activity}
              filters={filters}
              rows={rows}
              totalElementsInPage={total_elements_in_page}
              page={page}
              totalElements={total_elements}
              totalPages={total_pages}
            />
          </section>
        </section>
      </div>
    </section>
  )
}

export default ActivityPage