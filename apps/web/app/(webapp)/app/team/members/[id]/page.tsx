import React from 'react'
import { MemberDetails, MemberSections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { MEMBER_RECENT_ACTIVITIES, MEMBER_RECENT_ACTIVITIES_HEADER } from '@/data/membersData';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import moment from 'moment';
import { ToastMessage } from '@/app/(webapp)/(components)';
import { RefreshStoredToken } from '@/components/globalComponents';
import { getCookies } from '@/config/cookies';

const MemberPage = async ({ params, searchParams }: UrlParamsProps) => {
  const memberId = params?.id;
  const search_query = searchParams?.search_query || ''
  const date_filter = searchParams?.date_filter || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const dateFilter = date_filter ? JSON.parse(date_filter) : {};
  const filters = [search_query, date_filter, dateFilter?.start_date, dateFilter?.end_date];

  const fetchedRoles = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getRoles({
      page: '1',
      limit: '1000',
    }),
    method: 'GET',
    data: null
  });

  const fetchedMember: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getTeam({
      id: memberId || ''
    }),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedMember?.status == 401 || fetchedRoles?.status == 401) {
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

  let member = fetchedMember?.data;
  let roles = fetchedRoles?.data;

  const fetchedAuditTrails: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAuditTrails({
      page: `${page}`,
      limit: `${rows}`,
      name: member?.profile?.firstName,
      event: search_query,
      createdAt_gt: moment(dateFilter?.start_date).startOf('day').format()?.split('+')[0] + '.000Z',
      createdAt_l: moment(dateFilter?.end_date).endOf('day').format()?.split('+')[0] + '.000Z'
    }),
    method: 'GET',
    data: null
  });

  let raw_data = fetchedAuditTrails?.data?.map((trail: any) => {
    return({
      ...trail,
      member_name: `${trail?.user?.profile?.firstName} ${trail?.user?.profile?.lastName}`,
      event_type: trail?.event,
      description: trail?.description,
      timestamp: trail?.createdAt
    });
  });

  let table_headers =  MEMBER_RECENT_ACTIVITIES_HEADER;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      {
        /* SSR TOAST ERROR */
        (fetchedMember?.status != 200 && fetchedMember?.status != 201) && 
        <ToastMessage 
          message={fetchedMember?.message} 
        />
      }

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