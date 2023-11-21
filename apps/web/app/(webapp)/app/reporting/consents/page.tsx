import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { DatePicker, TopPanel } from '@/app/(webapp)/(components)'
import { CONSENTS_TABLE_DATA, CONSENTS_TABLE_HEADERS, CONSENTS_STATUS_DATA } from '@/data/consentData'
import { SearchBar, SelectElement } from '@/components/forms'
import { ConsentsTable } from './(components)'

const ConsentsPage = ({ searchParams }: UrlParamsProps) => {
  const status = searchParams?.status || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const date_sent = searchParams?.date_sent || ''

  const filters = [search_query, status, date_sent];
  const panel = CONSENTS_STATUS_DATA({
    all: 40, 
    approved: 32,
    pending: 2, 
    revoked: 1, 
    declined: 5
  });

  const headers = CONSENTS_TABLE_HEADERS;
  const consents = CONSENTS_TABLE_DATA;
  const total_pages = consents?.length;
  const total_elements_in_page = consents?.length;
  const total_elements = consents?.length;

  const status_list = CONSENTS_STATUS_DATA({})?.map(data => {
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
          Consents
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex-wrap flex items-center gap-[12px]'>
            <SearchBar 
              placeholder='Search consents'
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

            <DatePicker
              showShortcuts={true}
              dateFilter={date_sent}
              name='date_sent'
              innerLabel='Date Sent:'
              asSingle
              popoverDirection='down'
            />
          </div>

          <section className='w-full min-h-full flex flex-col items-center'>
            <ConsentsTable 
              tableHeaders={headers}
              rawData={consents}
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

export default ConsentsPage