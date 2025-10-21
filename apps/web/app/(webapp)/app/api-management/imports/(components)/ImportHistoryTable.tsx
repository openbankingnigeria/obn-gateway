'use client'

import { EmptyState, StatusBox, TableElement } from '@/app/(webapp)/(components)'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { TableProps } from '@/types/webappTypes/appTypes'
import { createColumnHelper } from '@tanstack/react-table'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as API from '@/config/endpoints'
import { getJsCookies } from '@/config/jsCookie'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const ImportHistoryTable = ({
  tableHeaders,
  rawData,
  filters,
  message,
  rows,
  page,
  totalElements,
  totalElementsInPage,
  totalPages,
}: TableProps) => {
  const columnHelper = createColumnHelper<any>()
  const router = useRouter()
  const environment = getJsCookies('environment')
  const [loading, setLoading] = useState<string | null>(null)

  // Transform data to match table headers
  const transformedData = rawData?.map(item => ({
    ...item,
    status: item.importStatus, // Map importStatus to status for StatusBox
    counts: `${item.importedCount} / ${item.failedCount}`,
  }))

  const handleRetry = async (importId: string) => {
    setLoading(importId)
    
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.retryAPIImport({ 
        environment: environment || 'development',
        id: importId 
      }),
      method: 'POST',
      data: null,
    })

    setLoading(null)

    if (result?.importId) {
      toast.success('Import retry initiated successfully')
      router.refresh()
    }
  }

  const actionColumn = columnHelper.accessor('actions', {
    header: () => 'Actions',
    cell: ({ row }) => (
      <div className='flex items-center gap-[12px]'>
        <Link
          href={`/app/api-management/imports/${row.original.id}`}
          className='text-f14 text-[#5277C7] cursor-pointer hover:underline'
        >
          View
        </Link>
        {
          (row.original.importStatus === 'failed' || row.original.importStatus === 'partial') &&
          <button
            onClick={() => handleRetry(row.original.id)}
            disabled={loading === row.original.id}
            className='text-f14 text-[#5277C7] cursor-pointer hover:underline disabled:opacity-50'
          >
            {loading === row.original.id ? 'Retrying...' : 'Retry'}
          </button>
        }
      </div>
    )
  })

  return (
    <div className='w-full h-full'>
      {
        (transformedData && transformedData?.length >= 1) ?
          <TableElement 
            tableHeaders={tableHeaders}
            rawData={transformedData}
            actionColumn={actionColumn}
            removePagination
            filters={filters}
            module='imports'
            rows={rows}
            page={page}
            totalElements={totalElements}
            totalElementsInPage={totalElementsInPage}
            totalPages={totalPages}
          />
        :
          <EmptyState 
            title={
              message?.toLowerCase()?.includes('no')  ?
              message : 
              `No import history at the moment`
            }
            body=''
            type='DEFAULT'
            containerStyle='h-[420px]'
          />
      }
    </div>
  )
}

export default ImportHistoryTable
