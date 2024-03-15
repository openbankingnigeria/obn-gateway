'use client'

import { EmptyState, TableElement } from '@/app/(webapp)/(components)'
import { TableProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const AuditTrailTable = ({
  tableHeaders,
  rawData,
  filters,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages
}: TableProps) => {

  // console.log(rawData);

  return (
    <>
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
            parentStyle='h-[calc(100vh-288px)]'
            body='There’s no information to show yet. Actions made on the system will show up here.'
          />
      }
    </>
  )
}

export default AuditTrailTable