import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { CollectionSection } from '../(components)';
import { COLLECTIONS_API_HEADERS, COLLECTIONS_API_CONSUMER_HEADERS, COLLECTIONS_REQUEST_METHOD, COLLECTIONS_TIER } from '@/data/collectionDatas';
import { applyAxiosRequest } from '@/hooks';
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout';
import { getCookies } from '@/config/cookies';

const CollectionPage = async ({ params, searchParams }: UrlParamsProps) => {
  const collectionId = params?.id;
  const request_method = searchParams?.request_method || '';
  const tier = searchParams?.tier || '';
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const environment = getCookies('environment');

  const fetchedCollection: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCollection({
      id: `${collectionId}`
    }),
    method: 'GET',
    data: null
  })

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  if (fetchedCollection?.status == 401) {
    return <Logout />
  }

  let collection = fetchedCollection?.data;
  let profile = fetchedProfile?.data;

  const userType = profile?.user?.role?.parent?.slug;

  const fetchedAPIs: any = userType == 'api-consumer' ?
    await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIsForCompany({ 
        environment: environment || 'development',
        collectionId,
        name: search_query,
        method: request_method
      }),
      method: 'GET',
      data: null
    })
    :
    await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIs({
        page: `${page}`,
        limit: `${rows}`,
        collectionId,
        environment: environment || 'development',
        name: search_query,
        method: request_method
      }),
      method: 'GET',
      data: null
    });

  let collections_api_list = userType == 'api-consumer' ?
    fetchedAPIs?.data?.filter((data: any) => data?.collectionId == collectionId) :
    fetchedAPIs?.data;
  let meta_data = fetchedAPIs?.meta_data;
  let collections_api = collections_api_list?.map((endpoint: any) => {
    return({
      ...endpoint,
      api_name: endpoint?.name,
      request_method: endpoint?.downstream?.method?.toString(),
      status: endpoint?.enabled ? 'enabled' : 'disabled',
      endpoint_url: endpoint?.upstream?.url || endpoint?.downstream?.url,
      tier: '',
      parameters: endpoint?.downstream?.path?.toString(),
    });
  })

  // const details = COLLECTIONS_TABLE_DATA.find((data: any) => data?.collection_name == collectionId);
  // const collections_api = COLLECTIONS_APIS;
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
  
  const filters = [search_query, request_method, tier]
  let table_headers = (
    userType == 'api-consumer' ? 
      COLLECTIONS_API_CONSUMER_HEADERS :
      COLLECTIONS_API_HEADERS
  );
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = collections_api_list?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  return (
    <section className='w-full flex flex-col gap-[20px]'>
      <header className='w-full flex flex-col gap-[12px]'>
        <h3 className='text-f18 font-[500] capitalize text-o-text-dark'>
          {collection?.name}
        </h3>

        <div className='text-o-text-medium3 text-f14'>
          <div dangerouslySetInnerHTML={{ __html: collection?.description }} />
        </div>
      </header>

      <div className='w-full flex flex-col'>
        <CollectionSection 
          rawData={collections_api}
          altData={profile}
          tableHeaders={table_headers}
          requestMethodList={request_method_list}
          tierList={tier_list}
          statusList={[]}
          rows={rows}
          details={collection}
          page={page}
          totalElementsInPage={total_elements_in_page}
          filters={filters}
          totalElements={total_elements}
          totalPages={total_pages}
        />
      </div>
    </section>
  )
}

export default CollectionPage