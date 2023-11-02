import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { ACTIVITY_TABLE_HEADERS, ACTIVITY_TABLE_DATA, ACTIVITY_STATUS_DATA } from '@/data/activityData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ActivityTable } from './(components)'
import { APIS_DATA_WITH_ALL } from '@/data/apisData'
import { ExportButton } from '@/app/(webapp)/(components)'

const ActivityPage = ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const search_apis = searchParams?.search_apis || ''

  const filters = [status, search_query, search_apis];

  const headers = ACTIVITY_TABLE_HEADERS;
  const activity = ACTIVITY_TABLE_DATA;
  const total_pages = activity?.length;
  const total_elements_in_page = activity?.length;
  const total_elements = activity?.length;

  const status_list = ACTIVITY_STATUS_DATA?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  });

  const api_list = APIS_DATA_WITH_ALL?.map(data => {
    return({
      label: data?.label,
      value: data?.value
    })
  });

  return (
    <section className='flex flex-col h-full  w-full'>
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Activity
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-start justify-between gap-[12px]'>
            <div className='w-fit flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search activity'
                searchQuery={search_query}
              />

              <SelectElement 
                name='status'
                options={status_list}
                value={status}
                innerLabel='Status:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              <SelectElement 
                name='search_apis'
                options={api_list}
                value={search_apis}
                innerLabel='API Name:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />
            </div>

            <ExportButton 
              module='activity'
            />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <ActivityTable 
              tableHeaders={headers}
              rawData={activity}
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

export default ActivityPage