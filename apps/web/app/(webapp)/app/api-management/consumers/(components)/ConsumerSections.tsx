import { DatePicker, EmptyState, TableElement, TransparentPanel } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms';
import { CONSUMER_DETAILS_PANEL } from '@/data/consumerData'
import React from 'react'

interface ConsumerDetailsProps {
  path: string;
  rawData: any[];
  tableHeaders: any[];
  filters: any[];
  rows: number;
  page: number;
  totalElements?: number;
  totalElementsInPage?: number;
  totalPages: number;
  statusList: any[];
}

const ConsumerSections = ({
  path,
  rawData,
  tableHeaders,
  filters,
  rows,
  page,
  statusList,
  totalElements,
  totalElementsInPage,
  totalPages,
}: ConsumerDetailsProps) => {

  return (
    <section className='w-full h-full flex flex-col gap-[20px]'>
      <TransparentPanel
        panel={CONSUMER_DETAILS_PANEL}
        currentValue={path}
      />

      <div className='w-full flex flex-col h-full'>
        {
          (rawData && rawData?.length >= 1) ?
            <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
              <h3 className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] border-o-border bg-o-bg2'>
                <div className='text-f16 font-[600] text-o-text-dark'>
                  {
                    path == 'consents' ?
                      'Consents' :
                      'API Activites'
                  }
                </div>
              </h3>

              <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
                <div className='w-full flex-wrap flex items-center gap-[12px]'>
                  <SearchBar 
                    placeholder={`Search ${path || 'APIs'}`}
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

                  {
                    path == 'consents' &&
                    <DatePicker
                      showShortcuts={true}
                      name='date_sent'
                      innerLabel='Date Sent:'
                      asSingle
                      popoverDirection='up'
                    />
                  }
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
              body='There’s no information to show for this user yet.'
            />
        }
      </div>
    </section>
  )
}

export default ConsumerSections