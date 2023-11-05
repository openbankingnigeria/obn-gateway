import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { COLLECTIONS_TABLE_DATA, COLLECTIONS_TABLE_HEADERS } from '@/data/collectionDatas'
import { SearchBar } from '@/components/forms'
import { CollectionsTable } from './(components)'

const CollectionsPage = ({ searchParams }: UrlParamsProps) => {
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1

  const filters = [search_query];

  const headers = COLLECTIONS_TABLE_HEADERS;
  const collections = COLLECTIONS_TABLE_DATA;
  const total_pages = collections?.length;
  const total_elements_in_page = collections?.length;
  const total_elements = collections?.length;

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