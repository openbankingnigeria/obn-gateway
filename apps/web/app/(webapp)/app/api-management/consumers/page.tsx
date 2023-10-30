import React from 'react'
import { ConsumersPageProps } from '@/types/webappTypes/appTypes'
import { TopPanel } from '@/app/(webapp)/(components)'
import { CONSUMERS_DATA, CONSUMERS_HEADER_DATA, CONSUMERS_STATUS_DATA } from '@/data/consumerData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ConsumersTable } from './(components)'

const ConsumersPage = ({ searchParams }: ConsumersPageProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const totalElements = Number(searchParams?.total_elements) || 0

  const filters = [status, search_query]
  // ARRANGED HAS SEEN ON DESIGN
  const panel = CONSUMERS_STATUS_DATA(
    1290, 28, 920, 109, 112
  );

  const headers = CONSUMERS_HEADER_DATA;
  const consumers = CONSUMERS_DATA;
  const total_pages = consumers?.length;

  const status_list = CONSUMERS_STATUS_DATA()?.map(data => {
    return({
      label: data?.name,
      value: data?.value
    })
  })


  return (
    <section className='flex flex-col h-full  w-full pt-[56px]'>
      <TopPanel 
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
              search_query={search_query}
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
              headerData={headers}
              rawData={consumers}
              filters={filters}
              rows={rows}
              page={page}
              totalElements={totalElements}
              totalPages={total_pages}
            />
          </section>
        </section>
      </div>
    </section>
  )
}

export default ConsumersPage