import React from 'react'
import { MemberDetails, MemberSections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { MEMBER_RECENT_ACTIVITIES, MEMBER_RECENT_ACTIVITIES_HEADER } from '@/data/membersData';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';

const MemberPage = async ({ params, searchParams }: UrlParamsProps) => {
  const memberId = params?.id;
  const search_query = searchParams?.search_query || ''
  const date_filter = searchParams?.date_filter || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const filters = [search_query, date_filter]
  const fetchedRoles = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getRoles(),
    method: 'GET',
    data: null
  });

  const fetchedMember = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getTeam({
      member_id: memberId || ''
    }),
    method: 'GET',
    data: null
  });

  if (fetchedMember?.status == 401 || fetchedRoles?.status == 401) {
    return <Logout />
  }

  let member = fetchedMember?.data;
  let roles = fetchedRoles?.data;

  let raw_data = MEMBER_RECENT_ACTIVITIES;

  let table_headers =  MEMBER_RECENT_ACTIVITIES_HEADER;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <MemberDetails 
        member={member} 
        roles={roles}
      />
      
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