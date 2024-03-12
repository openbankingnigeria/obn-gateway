import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { AUDIT_TRAIL_TABLE_HEADERS, AUDIT_TRAIL_EVENT_TYPE } from '@/data/auditTrailData'
import { SearchBar, SelectElement } from '@/components/forms'
import { AuditTrailTable } from './(components)'
import { DatePicker, ToastMessage } from '@/app/(webapp)/(components)'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import moment from 'moment'
import { RefreshStoredToken } from '@/components/globalComponents'
import { getCookies } from '@/config/cookies'

const AuditTrailPage = async ({ searchParams }: UrlParamsProps) => {
  const type = searchParams?.type || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const date_filter = searchParams?.date_filter || ''

  const dateFilter = date_filter ? JSON.parse(date_filter) : {};
  const filters = [search_query, type, dateFilter?.start_date, dateFilter?.end_date];

  const fetchedAuditTrails: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAuditTrails({
      page: `${page}`,
      limit: `${rows}`,
      name: search_query,
      event: type,
      createdAt_gt: moment(dateFilter?.start_date).startOf('day').format()?.split('+')[0] + '.000Z',
      createdAt_l: moment(dateFilter?.end_date).endOf('day').format()?.split('+')[0] + '.000Z'
    }),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedAuditTrails?.status == 401) {
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

  let meta_data = fetchedAuditTrails?.meta_data;
  let audit_trail = fetchedAuditTrails?.data?.map((trail: any) => {
    return({
      ...trail,
      member_name: `${trail?.user?.profile?.firstName} ${trail?.user?.profile?.lastName}`,
      email_address: trail?.user?.email,
      event_type: trail?.event,
      description: trail?.description,
      timestamp: trail?.createdAt
    })
  })
  const headers = AUDIT_TRAIL_TABLE_HEADERS;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = audit_trail?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  const event_type_list = AUDIT_TRAIL_EVENT_TYPE?.map(data => {
    return({
      label: data?.label,
      value: data?.value
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
        (fetchedAuditTrails?.status != 200 && fetchedAuditTrails?.status != 201) && 
        <ToastMessage 
          message={fetchedAuditTrails?.message} 
        />
      }
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Audit Trail
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-start justify-between gap-[12px]'>
            <div className='w-fit flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search by name'
                searchQuery={search_query}
              />

              <SelectElement 
                name='type'
                options={event_type_list}
                value={type}
                innerLabel='Event Type:'
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
          </div>

          <section className='w-full h-full min-h-full flex flex-col items-center'>
            <AuditTrailTable 
              tableHeaders={headers}
              rawData={audit_trail}
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

export default AuditTrailPage