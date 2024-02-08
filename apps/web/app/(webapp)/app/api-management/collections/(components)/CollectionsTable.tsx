'use client'

import { EmptyState, TableElement } from '@/app/(webapp)/(components)'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import Link from 'next/link'
import React from 'react'

const CollectionsTable = ({
  tableHeaders,
  rawData,
  altData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>();
  // console.log(altData);

  const actionColumn = columnHelper.accessor('actions', {
    header: () => '',
    cell: ({ row }) => (
      <Link 
        href={`/app/api-management/collections/${row.original.id}`}
        id={row.original.id} 
        className='text-f14 !text-[#5277C7] cursor-pointer capitalize'
      >
        View
      </Link>
    )
  })

  const handleRedirect = (id: string) => {
    return `/app/api-management/collections/${id}`;
  }

  return (
    <div className='w-full h-full'>
      {
        (rawData && rawData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={rawData}
            actionColumn={actionColumn}
            removePagination
            filters={filters}
            redirect={(value: string) => handleRedirect(value)}
            module='collections'
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
            parentStyle='h-[calc(100vh-388px)]'
            body='There’s no information to show for this query. Please try another query or clear your filters.'
          />
      }
    </div>
  )
}

export default CollectionsTable