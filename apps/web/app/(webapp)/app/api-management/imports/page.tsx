import React from 'react'
import { getCookies } from '@/config/cookies'
import * as API from '@/config/endpoints'
import { applyAxiosRequest } from '@/hooks'
import { ImportedSpecDataProps } from '@/types/dataTypes'
import { TableHeaderProps } from '@/types/webappTypes/appTypes'
import { ImportHistoryTable } from './(components)'
import Logout from '@/components/globalComponents/Logout'
import { ToastMessage } from '@/app/(webapp)/(components)'
import { RefreshStoredToken } from '@/components/globalComponents'

const tableHeaders: TableHeaderProps[] = [
  {
    accessor: 'name',
    header: 'Import Name'
  },
  {
    accessor: 'specFormat',
    header: 'Spec Format'
  },
  {
    accessor: 'status',
    header: 'Status'
  },
  {
    accessor: 'counts',
    header: 'Imported / Failed'
  },
  {
    accessor: 'createdAt',
    header: 'Created At'
  },
]

interface ImportHistoryPageProps {
  searchParams: {
    search_query?: string
    page?: string
    rows?: string
  }
}

const ImportHistoryPage = async ({ searchParams }: ImportHistoryPageProps) => {
  const environment = await getCookies('environment')
  const { search_query, page, rows } = searchParams

  const { result, error }: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPIImports({
      environment: environment || 'development',
      page: page || '1',
      limit: rows || '10',
    }),
    method: 'GET',
    data: null,
  })

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null; 
  
  if (result?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: { },
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${await getCookies('aperta-user-refreshToken')}`
      }
    });

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  const imports: ImportedSpecDataProps[] = result?.data || []
  const metadata = result?.metadata || {
    totalElements: 0,
    totalElementsInPage: 0,
    totalPages: 1,
    page: 1,
    rows: 10,
  }

  // Transform data to match table structure
  const transformedImports = imports.map(item => ({
    id: item.id,
    name: item.name || 'Unnamed Import',
    specFormat: item.specFormat.toUpperCase(),
    status: item.importStatus,
    counts: `${item.importedCount} / ${item.failedCount}`,
    createdAt: new Date(item.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    importStatus: item.importStatus,
    importedCount: item.importedCount,
    failedCount: item.failedCount,
  }))

  return (
    <div className='w-full'>
      {/* REFRESH TOKEN SECTION */}
      {
        refreshTokenRes?.data &&
        <RefreshStoredToken 
          data={refreshTokenRes?.data} 
        />
      }

      {/* SSR TOAST ERROR */}
      {
        (result?.status != 200 && result?.status != 201) && 
        <ToastMessage 
          message={result?.message} 
        />
      }
      
      <div className='pb-4 border-b border-o-border'>
        <h1 className='text-f24 font-semibold text-o-text-dark'>API Import History</h1>
        <p className='text-f14 text-o-text-medium3 mt-1'>
          View and manage your API specification import history
        </p>
      </div>

      <div className='mt-6'>
        <ImportHistoryTable
          tableHeaders={tableHeaders}
          rawData={transformedImports}
          filters={[search_query, page, rows]}
          message={result?.message || ''}
          rows={metadata.rows}
          page={metadata.page}
          totalElements={metadata.totalElements}
          totalElementsInPage={metadata.totalElementsInPage}
          totalPages={metadata.totalPages}
        />
      </div>
    </div>
  )
}

export default ImportHistoryPage
