import { DatePicker, EmptyState, TableElement, TransparentPanel } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms';
import { MEMBER_DETAILS_PANEL } from '@/data/membersData';
import { SectionsProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const MemberSections = ({
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
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <TransparentPanel
        panel={MEMBER_DETAILS_PANEL}
        currentValue={''}
      />

      <div className='w-full flex flex-col h-full'>
        {
          (rawData && rawData?.length >= 1) ?
            <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
              <h3 className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] border-o-border bg-o-bg2'>
                <div className='text-f16 font-[600] text-o-text-dark'>
                  API Activities
                </div>
              </h3>

              <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
                <div className='w-full flex-wrap flex items-center gap-[12px]'>
                  <SearchBar 
                    placeholder={`Search recent activities`}
                    searchQuery={filters[0]}
                  />

                  <DatePicker
                    showShortcuts={true}
                    dateFilter={filters[1]}
                    name='date_filter'
                    innerLabel='Date:'
                    asSingle
                    popoverDirection='up'
                  />
                </div>

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
              </div>
            </div>
            :
            <EmptyState 
              title='Nothing to show'
              type='DEFAULT'
              parentStyle='!h-[calc(100vh-600px)]'
              body='There’s no information to show yet.'
            />
        }
      </div>
    </section>
  )
}

export default MemberSections