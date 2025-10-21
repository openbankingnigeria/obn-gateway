import React from 'react'
import { getCookies } from '@/config/cookies'
import * as API from '@/config/endpoints'
import { applyAxiosRequest } from '@/hooks'
import { ImportedSpecDetailProps } from '@/types/dataTypes'
import Logout from '@/components/globalComponents/Logout'
import { ToastMessage } from '@/app/(webapp)/(components)'
import { RefreshStoredToken } from '@/components/globalComponents'
import Link from 'next/link'
import { IoArrowBack } from 'react-icons/io5'
import { ImportActions } from './(components)'

interface ImportDetailPageProps {
  params: {
    id: string
  }
}

const ImportDetailPage = async ({ params }: ImportDetailPageProps) => {
  const environment = await getCookies('environment')
  const { id } = params

  const result: any = await applyAxiosRequest({
    headers: {},
    apiEndpoint: API.getAPIImport({
      environment: environment || 'development',
      id,
    }),
    method: 'GET',
    data: null,
  })

  /** REFRESH TOKEN CHECK */
  let refreshTokenRes = null
  
  if (result?.status == 401) {
    refreshTokenRes = await applyAxiosRequest({
      headers: {},
      apiEndpoint: API?.refreshToken(),
      method: 'POST',
      data: {
        refreshToken: `${await getCookies('aperta-user-refreshToken')}`
      }
    })

    if (!(refreshTokenRes?.status == 200 || refreshTokenRes?.status == 201)) {
      return <Logout />
    }
  }

  const importDetail: ImportedSpecDetailProps = result?.data

  if (!importDetail) {
    return (
      <div className='w-full'>
        <ToastMessage message={result?.message || 'Import not found'} />
      </div>
    )
  }

  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    processing: 'bg-blue-100 text-blue-800',
    pending: 'bg-gray-100 text-gray-800',
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className='w-full flex flex-col gap-[20px]'>
      {/* REFRESH TOKEN SECTION */}
      {refreshTokenRes?.data && (
        <RefreshStoredToken data={refreshTokenRes?.data} />
      )}

      {/* SSR TOAST ERROR */}
      {(result?.status != 200 && result?.status != 201) && (
        <ToastMessage message={result?.message} />
      )}

      {/* Back Button */}
      <Link
        href='/app/api-management/imports'
        className='inline-flex items-center gap-[8px] text-o-text-medium3 hover:text-o-text-dark text-f14'
      >
        <IoArrowBack size={18} />
        <span>Back to Import History</span>
      </Link>

      {/* Header */}
      <div className='flex flex-col gap-[8px] pb-[16px] border-b border-o-border'>
        <div className='flex items-start justify-between'>
          <div className='flex flex-col gap-[6px]'>
            <h1 className='text-f20 font-[600] text-o-text-dark'>{importDetail.name}</h1>
            <p className='text-f13 text-o-text-medium3'>
              Imported {formatDate(importDetail.createdAt)}
              {importDetail.importedBy && ` by ${importDetail.importedBy.firstName} ${importDetail.importedBy.lastName}`}
            </p>
          </div>
          <span className={`px-[12px] py-[6px] rounded-[6px] text-f12 font-[500] ${statusColors[importDetail.importStatus]}`}>
            {importDetail.importStatus.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-[16px]'>
        <div className='flex flex-col gap-[6px] p-[16px] bg-white border border-o-border rounded-[8px]'>
          <p className='text-f12 text-o-text-medium3'>Spec Format</p>
          <p className='text-f18 font-[600] text-o-text-dark'>
            {importDetail.specFormat.toUpperCase().replace('_', ' ')}
          </p>
        </div>
        <div className='flex flex-col gap-[6px] p-[16px] bg-white border border-o-border rounded-[8px]'>
          <p className='text-f12 text-o-text-medium3'>Total Endpoints</p>
          <p className='text-f18 font-[600] text-o-text-dark'>
            {importDetail.importedCount + importDetail.failedCount}
          </p>
        </div>
        <div className='flex flex-col gap-[6px] p-[16px] bg-white border border-o-border rounded-[8px]'>
          <p className='text-f12 text-o-text-medium3'>Successfully Imported</p>
          <p className='text-f18 font-[600] text-green-600'>
            {importDetail.importedCount}
          </p>
        </div>
        <div className='flex flex-col gap-[6px] p-[16px] bg-white border border-o-border rounded-[8px]'>
          <p className='text-f12 text-o-text-medium3'>Failed</p>
          <p className='text-f18 font-[600] text-red-600'>
            {importDetail.failedCount}
          </p>
        </div>
      </div>

      {/* Collection Info */}
      {importDetail.collection && (
        <div className='flex flex-col gap-[12px] p-[20px] bg-white border border-o-border rounded-[8px]'>
          <h3 className='text-f14 font-[600] text-o-text-dark'>Collection</h3>
          <Link
            href={`/app/api-management/collections/${importDetail.collection.id}`}
            className='text-f14 text-o-blue hover:text-o-blue-hover hover:underline'
          >
            {importDetail.collection.name}
          </Link>
        </div>
      )}

      {/* Parsed Metadata */}
      {importDetail.parsedMetadata && Object.keys(importDetail.parsedMetadata).length > 0 && (
        <div className='flex flex-col gap-[16px] p-[20px] bg-white border border-o-border rounded-[8px]'>
          <h3 className='text-f14 font-[600] text-o-text-dark'>Spec Metadata</h3>
          <div className='flex flex-col gap-[12px]'>
            {importDetail.parsedMetadata.title && (
              <div className='flex flex-col gap-[4px]'>
                <span className='text-f12 font-[500] text-o-text-medium3'>Title</span>
                <span className='text-f14 text-o-text-dark'>{importDetail.parsedMetadata.title}</span>
              </div>
            )}
            {importDetail.parsedMetadata.description && (
              <div className='flex flex-col gap-[4px]'>
                <span className='text-f12 font-[500] text-o-text-medium3'>Description</span>
                <span className='text-f14 text-o-text-dark'>{importDetail.parsedMetadata.description}</span>
              </div>
            )}
            {importDetail.parsedMetadata.version && (
              <div className='flex flex-col gap-[4px]'>
                <span className='text-f12 font-[500] text-o-text-medium3'>Version</span>
                <span className='text-f14 text-o-text-dark'>{importDetail.parsedMetadata.version}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Log - Only show if there are errors */}
      {importDetail.failedCount > 0 && (
        <div className='flex flex-col gap-[16px] p-[20px] bg-white border border-o-border rounded-[8px]'>
          <div className='flex items-center gap-[8px]'>
            <h3 className='text-f14 font-[600] text-o-text-dark'>
              Import Errors
            </h3>
            <span className='text-f12 font-[500] text-o-text-muted2 bg-red-100 px-[10px] py-[4px] rounded-[4px]'>
              {importDetail.failedCount} {importDetail.failedCount === 1 ? 'error' : 'errors'}
            </span>
          </div>
          <div className='flex flex-col gap-[10px] max-h-[400px] overflow-auto pr-[8px]'>
            {importDetail.errorLog?.map((error, index) => (
              <div 
                key={index} 
                className='flex flex-col gap-[8px] p-[16px] bg-white border border-red-200 rounded-[8px] hover:border-red-300 transition-colors'
              >
                <div className='flex items-start gap-[8px]'>
                  <svg className='w-[16px] h-[16px] mt-[2px] flex-shrink-0' viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.33334C4.32 1.33334 1.33333 4.32001 1.33333 8.00001C1.33333 11.68 4.32 14.6667 8 14.6667C11.68 14.6667 14.6667 11.68 14.6667 8.00001C14.6667 4.32001 11.68 1.33334 8 1.33334ZM8 10.6667C7.63333 10.6667 7.33333 10.3667 7.33333 10V8.00001C7.33333 7.63334 7.63333 7.33334 8 7.33334C8.36667 7.33334 8.66667 7.63334 8.66667 8.00001V10C8.66667 10.3667 8.36667 10.6667 8 10.6667ZM8.66667 6.00001H7.33333V4.66668H8.66667V6.00001Z" fill="#DC2626"/>
                  </svg>
                  <div className='flex-1'>
                    <p className='text-f14 font-[600] text-o-text-dark mb-[4px]'>{error.endpoint}</p>
                    <p className='text-f13 text-red-600'>{error.error}</p>
                    {error.details && (
                      <pre className='text-f11 text-o-text-medium3 mt-[8px] p-[12px] bg-gray-50 rounded-[4px] overflow-x-auto'>
                        {typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Original Spec */}
      {importDetail.originalSpec && (
        <div className='flex flex-col gap-[16px] p-[20px] bg-white border border-o-border rounded-[8px]'>
          <h3 className='text-f14 font-[600] text-o-text-dark'>Original Spec File</h3>
          <div className='bg-o-bg-disabled p-[16px] rounded-[6px] border border-o-border max-h-[500px] overflow-auto'>
            <pre className='text-f12 text-o-text-dark whitespace-pre-wrap break-words font-mono'>
              {importDetail.originalSpec}
            </pre>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <ImportActions
        importId={id}
        environment={environment || 'development'}
        hasFailedEndpoints={importDetail.failedCount > 0}
      />
    </div>
  )
}

export default ImportDetailPage
