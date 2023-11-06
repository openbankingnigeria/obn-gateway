import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { TopPanel } from '@/app/(webapp)/(components)'
import { CONSUMERS_TABLE_DATA, CONSUMERS_TABLE_HEADERS, CONSUMERS_STATUS_DATA } from '@/data/consumerData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ConsumersTable } from './(components)'
import { APIS_DATA } from '@/data/apisData'

const ConsumersPage = ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const search_apis = searchParams?.search_apis || ''

  const filters = [status, search_query];
  const panel = CONSUMERS_STATUS_DATA({
    all: 1290, 
    pending: 28, 
    active: 920, 
    inactive: 109, 
    rejected: 112
  });

  const headers = CONSUMERS_TABLE_HEADERS;
  const consumers = CONSUMERS_TABLE_DATA;
  const total_pages = consumers?.length;
  const total_elements_in_page = consumers?.length;
  const total_elements = consumers?.length;
  const data_list = APIS_DATA;

  const status_list = CONSUMERS_STATUS_DATA({})?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  })


  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      <TopPanel 
        name='status'
        panel={panel}
        currentValue={status}
      />

      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Consumers
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex-wrap flex items-center gap-[12px]'>
            <SearchBar 
              placeholder='Search consumers'
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
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <ConsumersTable 
              tableHeaders={headers}
              rawData={consumers}
              filters={filters}
              rows={rows}
              totalElementsInPage={total_elements_in_page}
              page={page}
              searchQuery={search_apis}
              totalElements={total_elements}
              totalPages={total_pages}
              dataList={data_list}
            />
          </section>
        </section>
      </div>
    </section>
  )
}

export default ConsumersPage