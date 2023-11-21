import { searchParamsProps } from '@/types/webappTypes/appTypes'
import { greetByTime } from '@/utils/greetByTime'
import React from 'react'
import { APIConsumerDashboardTable, DashboardBanner } from '.'
import { COLLECTIONS_APIS, COLLECTIONS_REQUEST_METHOD, COLLECTIONS_TIER, DASHBOARD_API_HEADERS } from '@/data/collectionDatas'

const APIConsumerDashboardPage = ({
  search_query, request_method, tier, rows, page
}: searchParamsProps) => {
  
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
      <h2 className='text-o-text-dark capitalize text-f24 font-[500]'>
        {`${greetByTime()}, John Ajayi!`}
      </h2>

      <div className='w-full flex'>
        <DashboardBanner />
      </div>

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

export default APIConsumerDashboardPage