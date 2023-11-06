import React from 'react'
import { UrlParamsProps } from '@/types/webappTypes/appTypes'
import { AUDIT_TRAIL_TABLE_HEADERS, AUDIT_TRAIL_TABLE_DATA, AUDIT_TRAIL_EVENT_TYPE } from '@/data/auditTrailData'
import { SearchBar, SelectElement } from '@/components/forms'
import { AuditTrailTable } from './(components)'
import { DatePicker, ExportButton } from '@/app/(webapp)/(components)'

const AuditTrailPage = ({ searchParams }: UrlParamsProps) => {
  const type = searchParams?.type || ''
  const search_query = searchParams?.search_query || ''
  const rows = Number(searchParams?.rows) || 10
  const page = Number(searchParams?.page) || 1
  const date_filter = searchParams?.date_filter || ''

  const filters = [search_query, type, date_filter];

  const headers = AUDIT_TRAIL_TABLE_HEADERS;
  const audit_trail = AUDIT_TRAIL_TABLE_DATA;
  const total_pages = audit_trail?.length;
  const total_elements_in_page = audit_trail?.length;
  const total_elements = audit_trail?.length;

  const event_type_list = AUDIT_TRAIL_EVENT_TYPE?.map(data => {
    return({
      label: data?.label,
      value: data?.value
    })
  });

  return (
    <section className='flex flex-col h-full  w-full'>
      <div className='w-full h-full gap-[24px] flex flex-col'>
        <h2 className='text-f18 w-full font-[500] text-o-text-dark'>
          Audit Trail
        </h2>

        <section className='w-full h-full flex-col flex gap-[20px]'>
          <div className='w-full flex items-start justify-between gap-[12px]'>
            <div className='w-fit flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder='Search by name, email'
                searchQuery={search_query}
              />

              <SelectElement 
                name='type'
                options={event_type_list}
                value={type}
                innerLabel='Event Type:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              <DatePicker 
                showShortcuts={true}
                name='date_filter'
                dateFilter={date_filter}
              />
            </div>
          </div>

          <section className='w-full h-full min-h-full flex flex-col items-center'>
            <AuditTrailTable 
              tableHeaders={headers}
              rawData={audit_trail}
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

export default AuditTrailPage