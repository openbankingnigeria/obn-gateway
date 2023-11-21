import React from 'react'
import { ConsentsDetails, ConsentsSections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { CONSENTS_API_ACTIVITIES, CONSENTS_API_ACTIVITIES_STATUS, CONSENTS_API_ACTIVITIES_HEADERS } from '@/data/consentData';

const ConsentsPage = ({ params, searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || '';
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const api_activities = CONSENTS_API_ACTIVITIES;
  const filters = [search_query, status]

  let raw_data = api_activities;

  let status_list = CONSENTS_API_ACTIVITIES_STATUS?.map(status => {
    return ({
      label: status?.label,
      value: status?.value
    })
  });

  let table_headers = CONSENTS_API_ACTIVITIES_HEADERS;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <ConsentsDetails  />

      <ConsentsSections 
        rawData={raw_data}
        tableHeaders={table_headers}
        rows={rows}
        statusList={status_list}
        page={page}
        totalElementsInPage={total_elements_in_page}
        filters={filters}
        totalElements={total_elements}
        totalPages={total_pages}
      />
    </section>
  )
}

export default ConsentsPage