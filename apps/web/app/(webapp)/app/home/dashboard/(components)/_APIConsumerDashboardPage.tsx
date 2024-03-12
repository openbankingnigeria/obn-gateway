import { searchParamsProps } from '@/types/webappTypes/appTypes'
import { greetByTime } from '@/utils/greetByTime'
import React from 'react'
import { APIConsumerDashboardTable, DashboardBanner } from '.'
import { COLLECTIONS_APIS, COLLECTIONS_REQUEST_METHOD, COLLECTIONS_TIER, DASHBOARD_API_HEADERS } from '@/data/collectionDatas'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import { getCookies } from '@/config/cookies'
import { RefreshStoredToken } from '@/components/globalComponents'

const _APIConsumerDashboardPage = async ({
  search_query, request_method, tier, rows, page, alt_data
}: searchParamsProps) => {

  const fetchedDetails : any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompanyDetails(),
    method: 'GET',
    data: null
  });

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedDetails?.status == 401) {
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

  let details = fetchedDetails?.data;
  
  /* API CONSUMER */
  const request_method_list = COLLECTIONS_REQUEST_METHOD?.map(method => {
    return ({
      label: method?.label,
      value: method?.value
    });
  });

  const tier_list = COLLECTIONS_TIER?.map(tier => {
    return ({
      label: tier?.label,
      value: tier?.value
    });
  })

  const apis = COLLECTIONS_APIS;
  const filters = [search_query, request_method, tier];

  let raw_data = apis;

  let table_headers = DASHBOARD_API_HEADERS;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='flex flex-col gap-[24px] w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      <h2 className='text-o-text-dark capitalize text-f24 font-[500]'>
        {`${greetByTime()}, ${((alt_data?.firstName || '') + ' ' + (alt_data?.lastName || '')).trim()}!`}
      </h2>

      <section className='w-full flex'>
        <DashboardBanner 
          rawData={details}
        />
      </section>

      <div className='w-full flex flex-col'>
        <APIConsumerDashboardTable 
          rawData={raw_data}
          tableHeaders={table_headers}
          requestMethodList={request_method_list}
          tierList={tier_list}
          statusList={[]}
          rows={rows || 10}
          page={page || 1}
          totalElementsInPage={total_elements_in_page}
          filters={filters}
          totalElements={total_elements}
          totalPages={total_pages}
        />
      </div>
    </section>
  )
}

export default _APIConsumerDashboardPage