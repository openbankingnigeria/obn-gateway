import React from 'react'
import { ConsumerBusinessDetails, ConsumerDetails, ConsumerSections } from '../(components)'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { APIS_DATA } from '@/data/apisData';
import { CONSUMER_API_ACTIVITIES, CONSUMER_API_ACTIVITIES_HEADERS, 
  CONSUMER_API_ACTIVITIES_STATUS, CONSUMER_CONSENTS, CONSUMER_CONSENTS_HEADERS, 
  CONSUMER_COLLECTIONS_FULLDATA, CONSUMER_COLLECTIONS_HEADERS, CONSUMER_CONSENTS_STATUS } from '@/data/consumerData';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';

const ConsumerPage = async ({ params, searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || '';
  const path = searchParams?.path || '';
  const consumerId = params?.id;
  const search_query = searchParams?.search_query || ''
  const date_sent = searchParams?.date_sent || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const search_apis = searchParams?.search_apis || ''

  const environment = 'development';

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  const fetchedConsumer: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCompany({
      id: `${consumerId}`,
    }),
    method: 'GET',
    data: null
  });

  
  const fetchedCollection: any = (!path) ?
    await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getCompanyAPIs({
        page: `${page}`,
        limit: `${rows}`,
        environment,
        companyId: `${consumerId}`,
      }),
      method: 'GET',
      data: null
    }) : [];

  const fetchedApiActivity: any = (path == 'api_activities') ?
    await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPILogs({
        page: `${page}`,
        limit: `${rows}`,
        environment,
        companyId: `${consumerId}`,
      }),
      method: 'GET',
      data: null
    }) : [];


  if (fetchedConsumer?.status == 401) {
    return <Logout />
  }

  let consumer = fetchedConsumer?.data
  let profile = fetchedProfile?.data;

  const apis_list = APIS_DATA;
  const api_activities = fetchedApiActivity?.data?.map((activity: any) => {
    return({
      ...activity,
      api_name: activity?.name,
      status: activity?.status,
      endpoint_url: activity?.request?.url,
      timestamp: activity?.timestamp,
    })
  });
  const consents = CONSUMER_CONSENTS;

  const collections = CONSUMER_COLLECTIONS_FULLDATA;
  // const collections = fetchedCollection?.data?.map((collection: any) => {
  //   return({
  //     ...collection,
  //     collection_name: collection?.name,
  //     endpoints: collection?.endpoints,
  //     categories: collection?.categories
  //   })
  // });

  const filters = [search_query, status, date_sent]

  let raw_data = path == 'consents' ? 
    consents : path == 'api_activities' ? 
      api_activities : collections;

  let pathStatus = path == 'consents' ? 
    CONSUMER_CONSENTS_STATUS : path == 'api_activities' ?
      CONSUMER_API_ACTIVITIES_STATUS : [];

  let status_list = pathStatus?.map(status => {
    return ({
      label: status?.label,
      value: status?.value
    })
  });

  let table_headers = path == 'consents' ? 
    CONSUMER_CONSENTS_HEADERS : path == 'api_activities' ?
      CONSUMER_API_ACTIVITIES_HEADERS:
      CONSUMER_COLLECTIONS_HEADERS;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <ConsumerDetails 
        status={status}
        rawData={consumer}
        profileData={profile}
        dataList={apis_list}
        searchQuery={search_apis}
      />
      {
        consumer?.type === 'licensed-entity' &&
          <ConsumerBusinessDetails  
            rawData={consumer}
          />
      }
      <ConsumerSections 
        path={path}
        rawData={raw_data}
        altData={consumer}
        profileData={profile}
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

export default ConsumerPage