'use client'

import { AppCenterModal, AppRightModal, EmptyState, TableElement, TwoFactorAuthModal } from '@/app/(webapp)/(components)'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import React from 'react'

const ConsentsTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();

  const actionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      <Link 
        href={`/app/reporting/consents/${row.original.id}`}
        id={row.original.id} 
        className='text-f14 text-o-blue cursor-pointer capitalize'
      >
        View
      </Link>
    )
  })

  return (
    <>
      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={actionColumn}
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
            parentStyle='h-[calc(100vh-288px)]'
            body='There’s no information to show yet. Consents made will appear here.'
          />
      }
    </>
  )
}

export default ConsentsTable