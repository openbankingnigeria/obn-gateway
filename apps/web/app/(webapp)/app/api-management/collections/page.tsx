import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { COLLECTIONS_TABLE_HEADERS } from '@/data/collectionDatas'
import { SearchBar } from '@/components/forms'
import { CollectionsTable } from './(components)'
import { applyAxiosRequest } from '@/hooks'
import * as API from '@/config/endpoints';
import Logout from '@/components/globalComponents/Logout'
import { getJsCookies } from '@/config/jsCookie'
import { ToastMessage } from '@/app/(webapp)/(components)'
import { getCookies } from '@/config/cookies'
import { RefreshStoredToken } from '@/components/globalComponents'

const CollectionsPage = async ({ searchParams }: UrlParamsProps) => {
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const environment = getCookies('environment');

  const filters = [search_query];

  const fetchedProfile: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getProfile(),
    method: 'GET',
    data: null
  });

  let profile = fetchedProfile?.data;
  const userType = profile?.user?.role?.parent?.slug;

  const fetchedCollections: any = userType == 'api-provider' &&
  await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getCollections(),
    method: 'GET',
    data: null
  })

  const fetchedConsumerCollections: any = userType == 'api-consumer' &&
  await applyAxiosRequest({
    headers: {},
    apiEndpoint: API?.getCompanyCollections({
      page: '1',
      limit: '20',
      environment: environment || 'development'
    }),
    method: 'GET',
    data: null
  })

  // const fetchedAPIs: any = userType == 'api-consumer' ?
  //   await applyAxiosRequest({
  //     headers: {},
  //     apiEndpoint: API.getAPIsForCompany({ 
  //       environment: environment || 'development' 
  //     }),
  //     method: 'GET',
  //     data: null
  //   })
  //   :
  //   null;

 
  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (fetchedCollections?.status == 401 || fetchedConsumerCollections?.status == 401) {
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

  let meta_data = fetchedCollections?.meta_data;
  // let apis = fetchedAPIs?.data;
  // let apisId = apis?.map((item: any) => item?.collectionId);
  let consumerCollectionMessage = fetchedConsumerCollections?.message || fetchedCollections?.message;
  let collection_list = userType == 'api-consumer' ? 
    fetchedConsumerCollections?.data?.filter((collection: any) => collection?.name?.toLowerCase().includes(search_query?.toLowerCase())) : 
    fetchedCollections?.data?.filter((collection: any) => collection?.name?.toLowerCase().includes(search_query?.toLowerCase()));

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

  // console.log(fetchedCollections);

  return (
    <section className='flex flex-col h-full  w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
          refreshTokenRes?.data &&
          <RefreshStoredToken 
            data={refreshTokenRes?.data} 
          />
        }

      <div className='w-full h-full gap-[24px] flex flex-col'>
        {
          /* SSR TOAST ERROR */
          (fetchedCollections?.status != 200 && fetchedCollections?.status != 201) && 
          <ToastMessage 
            message={fetchedCollections?.message} 
          />
        }

        {
          /* SSR TOAST ERROR */
          (fetchedConsumerCollections?.status != 200 && fetchedConsumerCollections?.status != 201) && 
          <ToastMessage 
            message={fetchedConsumerCollections?.message} 
          />
        }

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
              message={consumerCollectionMessage}
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