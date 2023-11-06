import { EmptyState, TableElement } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms';
import { SectionsProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ConsentsSections = ({
  rawData,
  tableHeaders,
  filters,
  rows,
  page,
  statusList,
  totalElements,
  totalElementsInPage,
  totalPages,
}: SectionsProps) => {

  return (
    <section className='w-full flex flex-col h-full'>
      <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
        <h3 className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] border-o-border bg-o-bg2'>
          <div className='text-f16 font-[600] text-o-text-dark'>
            API Activities
          </div>
        </h3>

        <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
          <div className='w-full flex-wrap flex items-center gap-[12px]'>
            <SearchBar 
              placeholder={`Search APIs`}
              searchQuery={filters[0]}
            />

            <SelectElement 
              name='status'
              options={statusList}
              value={filters[1]}
              innerLabel='Status:'
              containerStyle='!w-fit cursor-pointer'
              small
              removeSearch
              optionStyle='!top-[38px]'
              forFilter
            />
          </div>

          {
            (rawData && rawData?.length >= 1) ?
              <TableElement 
                tableHeaders={tableHeaders}
                rawData={rawData}
                filters={filters}
                totalElementsInPage={totalElementsInPage}
                rows={rows}
                page={page}
                totalElements={totalElements}
                totalPages={totalPages}
              />
              :
              <EmptyState 
                title='Nothing to show'
                type='DEFAULT'
                parentStyle='!h-[calc(100vh-600px)]'
                body='There’s no information to show yet.'
              />
          }
        </div>
      </div>
    </section>
  )
}

export default ConsentsSections