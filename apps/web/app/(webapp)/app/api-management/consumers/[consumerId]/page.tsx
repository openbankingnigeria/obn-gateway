import React from 'react'
import { ConsumerDetails, ConsumerSections } from '../(components)'
import { SearchParamsProps } from '@/types/webappTypes/appTypes'
import { APIS_DATA } from '@/data/apisData';
import { CONSUMER_API_ACTIVITIES, CONSUMER_API_ACTIVITIES_HEADERS, CONSUMER_API_ACTIVITIES_STATUS, CONSUMER_CONSENTS, CONSUMER_CONSENTS_HEADERS, CONSUMER_CONSENTS_STATUS } from '@/data/consumerData';

const ConsumerPage = ({ searchParams }: SearchParamsProps) => {
  const status = searchParams?.status || '';
  const path = searchParams?.path || '';
  const search_query = searchParams?.search_query || ''
  const date_sent = searchParams?.date_sent || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const totalElements = Number(searchParams?.total_elements) || 0
  const search_apis = searchParams?.search_apis || ''

  const apis_list = APIS_DATA;
  const api_activities = CONSUMER_API_ACTIVITIES;
  const consents = CONSUMER_CONSENTS;
  const filters = [search_query, status, date_sent]

  let raw_data = path == 'consents' ? 
    consents : api_activities;

  let pathStatus = path == 'consents' ? 
    CONSUMER_CONSENTS_STATUS : 
    CONSUMER_API_ACTIVITIES_STATUS

  let status_list = pathStatus?.map(status => {
    return ({
      label: status?.label,
      value: status?.value
    })
  });

  let table_headers = path == 'consents' ? 
    CONSUMER_CONSENTS_HEADERS :
    CONSUMER_API_ACTIVITIES_HEADERS;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <ConsumerDetails 
        status={status}
        data_list={apis_list}
        search_query={search_apis}
      />
      <ConsumerSections 
        path={path}
        rawData={raw_data}
        tableHeaders={table_headers}
        rows={rows}
        status_list={status_list}
        page={page}
        totalElementsInPage={total_elements_in_page}
        filters={filters}
        totalElements={totalElements}
        totalPages={total_pages}
      />
    </section>
  )
}

export default ConsumerPage