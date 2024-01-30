import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ACTIVITY_TABLE_HEADERS, ACTIVITY_TABLE_DATA, ACTIVITY_STATUS_DATA } from '@/data/activityData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ActivityTable } from './(components)'
import { APIS_DATA_WITH_ALL } from '@/data/apisData'
import { ExportButton } from '@/app/(webapp)/(components)'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'

const ActivityPage = async({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const search_apis = searchParams?.search_apis || '';
  const environment = 'development';

  const filters = [status, search_query, search_apis];

  const fetchedActivities: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPILogs({
      page: `${page}`,
      limit: `${rows}`,
      environment
    }),
    method: 'GET',
    data: null
  });

  if (fetchedActivities?.status == 401) {
    return <Logout />
  }

  let meta_data = fetchedActivities?.meta_data;
  let activity = fetchedActivities?.data?.map((activity: any) => {
    return({
      ...activity,
      reference_id: activity?.id,
      consumer_name: activity?.company?.name,
      email_address: activity?.email_address,
      api_name: activity?.name,
      status: activity?.status,
      endpoint_url: activity?.request?.url,
      timestamp: activity?.timestamp,
    })
  })

  const headers = ACTIVITY_TABLE_HEADERS;
  // const activity = ACTIVITY_TABLE_DATA;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = activity?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  const status_list = ACTIVITY_STATUS_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });

  const api_list = APIS_DATA_WITH_ALL?.map(data => {
    return({
      label: data?.label,
      value: data?.value
    })
  });

  return (
    <section className='flex flex-col h-full  w-full'>
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Activity
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-start justify-between gap-[12px]'>
            <div className='w-fit flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search activity'
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
                options={api_list}
                value={search_apis}
                innerLabel='API Name:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
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