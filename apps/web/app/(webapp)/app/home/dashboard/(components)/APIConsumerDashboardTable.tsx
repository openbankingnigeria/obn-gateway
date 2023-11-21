'use client'

import { ConfigurationBox, EmptyState, TableElement } from '@/app/(webapp)/(components)'
import { SearchBar, SelectElement } from '@/components/forms'
import { SectionsProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import React from 'react'
import Link from 'next/link'

const APIConsumerDashboardTable = ({
  rawData,
  tableHeaders,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
  requestMethodList,
  tierList
}: SectionsProps) => {
  const columnHelper = createColumnHelper<any>();

  const actionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      <Link 
        href={`/app/home/dashboard`}
        id={row.original.id} 
        className='text-f14 whitespace-nowrap !text-[#5277C7] border-b-[1.5px] border-[#5277C7] cursor-pointer capitalize'
      >
        View metrics
      </Link>
    )
  })

  return (
    <>
      <section className='w-full flex flex-col h-full'>
        <div className='w-full bg-white border border-o-border rounded-[10px] h-fit'>
          <header className='px-[20px] py-[16px] w-full border-b rounded-tr-[10px] rounded-tl-[10px] flex items-center justify-between border-o-border bg-o-bg2'>
            <h3 className='text-f16 font-[600] text-o-text-dark'>
              APIs
            </h3>

            <div className='w-fit gap-[8px] flex items-center'>
              <div className='text-f14 text-o-text-medium3 w-fit flex items-center gap-[8px]'>
                <div className='w-fit flex items-center gap-[4px]'>
                  Enabled
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#clip0_760_19919)">
                      <path d="M6 8V6M6 4H6.005M11 6C11 8.76142 8.76142 11 6 11C3.23858 11 1 8.76142 1 6C1 3.23858 3.23858 1 6 1C8.76142 1 11 3.23858 11 6Z" stroke="#666D80" strokeLinecap="round" strokeLinejoin="round" fill='transparent' />
                    </g>
                    <defs>
                      <clipPath id="clip0_760_19919">
                        <rect width="12" height="12" fill="white"/>
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                
                <ConfigurationBox 
                  value={29}
                />
              </div>
            </div>
          </header>

          <div className='w-full p-[20px] rounded-br-[10px] rounded-bl-[10px] flex flex-col gap-[12px] bg-white'>
            <div className='w-full flex-wrap flex items-center gap-[12px]'>
              <SearchBar 
                placeholder={`Search APIs`}
                searchQuery={filters[0]}
              />

              <SelectElement 
                name='request_method'
                options={requestMethodList || []}
                value={filters[1]}
                innerLabel='Method:'
                containerStyle='!w-fit cursor-pointer'
                small
                removeSearch
                optionStyle='!top-[38px]'
                forFilter
              />

              <SelectElement 
                name='tier'
                options={tierList || []}
                value={filters[2]}
                innerLabel='Tier:'
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
                  actionColumn={actionColumn}
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
                  body='There’s no information to show yet. Complete your account setup to see APIs available to you.'
                />
            }
          </div>
        </div>
      </section>
    </>
  )
}

export default APIConsumerDashboardTable