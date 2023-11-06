import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { CollectionSection } from '../(components)';
import { COLLECTIONS_APIS, COLLECTIONS_API_HEADERS, COLLECTIONS_REQUEST_METHOD, COLLECTIONS_TABLE_DATA, COLLECTIONS_TIER } from '@/data/collectionDatas';

const CollectionPage = ({ params, searchParams }: UrlParamsProps) => {
  const collectionName = params?.id;
  const request_method = searchParams?.request_method || '';
  const tier = searchParams?.tier || '';
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const details = COLLECTIONS_TABLE_DATA.find((data: any) => data?.collection_name == collectionName);
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
  
  const collections_api = COLLECTIONS_APIS;
  const filters = [search_query, request_method, tier]

  let raw_data = collections_api;

  let table_headers = COLLECTIONS_API_HEADERS;

  const total_pages = raw_data?.length;
  const total_elements_in_page = raw_data?.length;
  const total_elements = raw_data?.length;

  return (
    <section className='w-full flex flex-col gap-[20px]'>
      <header className='w-full flex flex-col gap-[12px]'>
        <h3 className='text-f18 font-[500] capitalize text-o-text-dark'>
          {details?.collection_name}
        </h3>

        <div className='text-o-text-medium3 text-f14'>
          {details?.description}
        </div>
      </header>

      <div className='w-full flex flex-col'>
        <CollectionSection 
          rawData={raw_data}
          tableHeaders={table_headers}
          requestMethodList={request_method_list}
          tierList={tier_list}
          statusList={[]}
          rows={rows}
          details={details}
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