import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { COLLECTIONS_TABLE_HEADERS } from '@/data/collectionDatas'
import { SearchBar } from '@/components/forms'
import { CollectionsTable } from './(components)'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'

const CollectionsPage = async ({ searchParams }: UrlParamsProps) => {
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const environment = 'development';

  const filters = [search_query];

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  let profile = fetchedProfile?.data;
  const userType = profile?.user?.role?.parent?.slug;

  const fetchedCollections: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCollections(),
    method: 'GET',
    data: null
  })

  const fetchedAPIs: any = userType == 'api-consumer' ?
    await applyAxiosRequest({
      headers: {},
      apiEndpoint: API.getAPIsForCompany({ environment }),
      method: 'GET',
      data: null
    })
    :
    null;

  if (fetchedCollections?.status == 401) {
    return <Logout />
  }

  let meta_data = fetchedCollections?.meta_data;
  let apis = fetchedAPIs?.data;
  let apisId = apis?.map((item: any) => item?.collectionId);
  let collection_list = userType == 'api-consumer' ? 
    fetchedCollections?.data.filter((collection: any) => apisId.includes(collection?.id) && collection?.name.includes(search_query)) : 
    fetchedCollections?.data?.filter((collection: any) => collection?.name.includes(search_query));

  const collections = collection_list?.map((collection: any) => {
    return ({
      ...collection,
      collection_name: collection?.name,
      description: collection?.description,
    })
  })
  const headers = COLLECTIONS_TABLE_HEADERS;
  const total_pages = meta_data?.totalNumberOfPages;
  const total_elements_in_page = collection_list?.length || meta_data?.pageSize;
  const total_elements = meta_data?.totalNumberOfRecords;

  return (
    <section className='flex flex-col h-full  w-full'>
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Collections
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex-wrap flex items-center'>
            <SearchBar 
              placeholder='Search collections'
              searchQuery={search_query}
            />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <CollectionsTable 
              tableHeaders={headers}
              rawData={collections}
              // altData={apis}
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

export default CollectionsPage