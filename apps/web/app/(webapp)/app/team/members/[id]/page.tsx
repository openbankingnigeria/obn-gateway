import React from 'react'
import { MemberDetails, MemberSections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { MEMBER_RECENT_ACTIVITIES, MEMBER_RECENT_ACTIVITIES_HEADER } from '@/data/membersData';

const MemberPage = ({ params, searchParams }: UrlParamsProps) => {
  const memberId = params?.id;
  const search_query = searchParams?.search_query || ''
  const date_filter = searchParams?.date_filter || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const filters = [search_query, date_filter]

  let raw_data = MEMBER_RECENT_ACTIVITIES;

  let table_headers =  MEMBER_RECENT_ACTIVITIES_HEADER;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <MemberDetails  />
      
      <MemberSections 
        rawData={raw_data}
        tableHeaders={table_headers}
        rows={rows}
        page={page}
        statusList={[]}
        totalElementsInPage={total_elements_in_page}
        filters={filters}
        totalElements={total_elements}
        totalPages={total_pages}
      />
    </section>
  )
}

export default MemberPage