'use client'

import { DragAndUploadElement, InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import * as API from '@/config/endpoints'
import { ImportApiSpecDataProps, ImportResultDataProps } from '@/types/dataTypes'
import { ImportSpecModalProps } from '@/types/webappTypes/componentsTypes'
import React, { FormEvent, useState } from 'react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

const ImportSpecModal = ({
  close,
  collectionId,
  environment,
  collections
}: ImportSpecModalProps) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [specFile, setSpecFile] = useState<any>(null)
  const [selectedCollectionId, setSelectedCollectionId] = useState(collectionId || '')
  const [collectionName, setCollectionName] = useState('')
  const [upstreamBaseUrl, setUpstreamBaseUrl] = useState('')
  const [downstreamBaseUrl, setDownstreamBaseUrl] = useState('')
  const [enableByDefault, setEnableByDefault] = useState(true)
  const [defaultTiers, setDefaultTiers] = useState('0,1')
  const [requireAuth, setRequireAuth] = useState(false)
  const [importResult, setImportResult] = useState<ImportResultDataProps | null>(null)

  const incorrect = !specFile || (!selectedCollectionId && !collectionName)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (incorrect || !specFile) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', specFile)
      
      if (selectedCollectionId) {
        formData.append('collectionId', selectedCollectionId)
      } else if (collectionName) {
        formData.append('collectionName', collectionName)
      }

      if (upstreamBaseUrl) {
        formData.append('upstreamBaseUrl', upstreamBaseUrl)
      }
      if (downstreamBaseUrl) {
        formData.append('downstreamBaseUrl', downstreamBaseUrl)
      }
      formData.append('enableByDefault', String(enableByDefault))
      formData.append('defaultTiers', defaultTiers)
      formData.append('requireAuth', String(requireAuth))

      const result: any = await clientAxiosRequest({
        headers: { 'Content-Type': 'multipart/form-data' },
        apiEndpoint: API.postImportAPISpec({ environment }),
        method: 'POST',
        data: formData,
      })

      setLoading(false)

      if (result?.data?.importId) {
        // Store the result to show details (data is nested in response)
        const importData: ImportResultDataProps = result.data
        setImportResult(importData)
        
        // Show success message
        if (importData.failedCount === 0) {
          toast.success(`Successfully imported all ${importData.totalEndpoints} endpoints`)
        } else if (importData.successCount > 0) {
          toast.warning(
            `Imported ${importData.successCount} of ${importData.totalEndpoints} endpoints. ${importData.failedCount} failed.`
          )
        } else {
          toast.error(`Failed to import all ${importData.totalEndpoints} endpoints`)
        }
        
        router.refresh()
      }
    } catch (error: any) {
      setLoading(false)
      toast.error(error?.message || 'Failed to import specification')
    }
  }

  const handleViewDetails = () => {
    close()
    router.push(`/app/api-management/imports`)
  }

  const handleCloseResults = () => {
    close()
  }

  // Show results view if import completed
  if (importResult) {
    return (
      <div className='flex flex-col h-full w-full relative'>
        <div className='flex flex-col h-[calc(100%-90px)] overflow-auto gap-[20px] w-full'>
          {/* Summary Card */}
          <div className='flex flex-col gap-[16px] p-[20px] bg-o-bg-disabled rounded-[8px] border border-o-border'>
            <h3 className='text-f18 font-[600] text-o-text-dark'>Import Summary</h3>
            <div className='grid grid-cols-2 gap-[16px]'>
              <div className='flex flex-col gap-[6px] p-[16px] bg-white rounded-[6px]'>
                <p className='text-f12 text-o-text-muted2 font-[500]'>Total Endpoints</p>
                <p className='text-f24 font-[600] text-o-text-dark'>{importResult.totalEndpoints}</p>
              </div>
              <div className='flex flex-col gap-[6px] p-[16px] bg-white rounded-[6px]'>
                <p className='text-f12 text-o-text-muted2 font-[500]'>Status</p>
                <p className={`text-f16 font-[600] uppercase ${
                  importResult.status === 'completed' ? 'text-green-600' : 
                  importResult.status === 'partial' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {importResult.status}
                </p>
              </div>
              <div className='flex flex-col gap-[6px] p-[16px] bg-white rounded-[6px]'>
                <p className='text-f12 text-o-text-muted2 font-[500]'>Successful</p>
                <p className='text-f24 font-[600] text-green-600'>{importResult.successCount}</p>
              </div>
              <div className='flex flex-col gap-[6px] p-[16px] bg-white rounded-[6px]'>
                <p className='text-f12 text-o-text-muted2 font-[500]'>Failed</p>
                <p className='text-f24 font-[600] text-red-600'>{importResult.failedCount}</p>
              </div>
            </div>
          </div>

          {/* Errors List */}
          {importResult.errors && importResult.errors.length > 0 && (
            <div className='flex flex-col gap-[12px] px-[20px]'>
              <div className='flex items-center justify-between'>
                <h3 className='text-f16 font-[600] text-o-text-dark'>
                  Failed Endpoints
                </h3>
                <span className='text-f12 font-[500] text-o-text-muted2 bg-red-100 px-[10px] py-[4px] rounded-[4px]'>
                  {importResult.errors.length} errors
                </span>
              </div>
              <div className='flex flex-col gap-[10px] max-h-[400px] overflow-auto pr-[8px]'>
                {importResult.errors.map((error, index) => (
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Success Message if all succeeded */}
          {importResult.errors.length === 0 && (
            <div className='flex items-center gap-[12px] p-[16px] bg-green-50 border border-green-200 rounded-[8px]'>
              <svg className='w-[24px] h-[24px] flex-shrink-0' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#16A34A"/>
              </svg>
              <div>
                <p className='text-f14 font-[600] text-green-800'>All endpoints imported successfully!</p>
                <p className='text-f12 text-green-600'>You can now view them in the collections.</p>
              </div>
            </div>
          )}
        </div>

        <div className='px-[20px] w-full mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between border-t border-o-border pt-[20px]'>
          <Button
            title='Close'
            effect={handleCloseResults}
            small
            outlined
          />

          <Button
            title='View Import History'
            effect={handleViewDetails}
            small
          />
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <div className='w-full flex flex-col gap-[16px]'>
          <DragAndUploadElement
            required={true}
            label='API Specification File'
            name='specFile'
            changeValue={(file: any) => setSpecFile(file)}
            containerStyle='mb-2'
            allowedTypes={['application/json', 'application/x-yaml', 'text/yaml', 'text/x-yaml', 'application/yaml']}
            maxSizeMB={10}
          />
          <p className='text-f12 text-o-text-muted2 -mt-2'>
            Supported formats: OpenAPI v2/v3, Swagger, Postman Collection (JSON or YAML, max 10MB)
          </p>
        </div>

        {collections && collections.length > 0 ? (
          <SelectElement
            name='collectionId'
            label='Select Collection'
            required={!collectionName}
            value={selectedCollectionId}
            changeValue={setSelectedCollectionId}
            options={[
              { value: '', label: 'Create new collection' },
              ...collections.map((col) => ({ value: col.id, label: col.name }))
            ]}
          />
        ) : null}

        {!selectedCollectionId && (
          <InputElement
            name='collectionName'
            label='New Collection Name'
            required={!selectedCollectionId}
            value={collectionName}
            changeValue={setCollectionName}
            placeholder='e.g., Payment APIs'
          />
        )}

        <div className='w-full flex flex-col gap-[6px]'>
          <InputElement
            name='upstreamBaseUrl'
            label='Upstream Base URL'
            required={false}
            value={upstreamBaseUrl}
            changeValue={setUpstreamBaseUrl}
            placeholder='https://api.backend.com'
          />
          <p className='text-f12 text-o-text-muted2'>
            Override base URL from specification
          </p>
        </div>

        <div className='w-full flex flex-col gap-[6px]'>
          <InputElement
            name='downstreamBaseUrl'
            label='Downstream Base URL'
            required={false}
            value={downstreamBaseUrl}
            changeValue={setDownstreamBaseUrl}
            placeholder='https://gateway.example.com'
          />
          <p className='text-f12 text-o-text-muted2'>
            Gateway base URL for downstream endpoints
          </p>
        </div>

        <div className='w-full flex flex-col gap-[6px]'>
          <InputElement
            name='defaultTiers'
            label='Default Tiers'
            required={false}
            value={defaultTiers}
            changeValue={setDefaultTiers}
            placeholder='0,1,2'
          />
          <p className='text-f12 text-o-text-muted2'>
            Comma-separated tier values for imported endpoints
          </p>
        </div>

        <div className='flex items-center gap-[12px] p-[16px] border border-o-border rounded-[8px]'>
          <input
            type='checkbox'
            id='enableByDefault'
            name='enableByDefault'
            checked={enableByDefault}
            onChange={(e) => setEnableByDefault(e.target.checked)}
            className='w-[18px] h-[18px] cursor-pointer'
          />
          <label
            htmlFor='enableByDefault'
            className='text-f14 text-o-text-dark cursor-pointer'
          >
            Enable APIs by default
          </label>
        </div>

        <div className='flex items-center gap-[12px] p-[16px] border border-o-border rounded-[8px]'>
          <input
            type='checkbox'
            id='requireAuth'
            name='requireAuth'
            checked={requireAuth}
            onChange={(e) => setRequireAuth(e.target.checked)}
            className='w-[18px] h-[18px] cursor-pointer'
          />
          <label
            htmlFor='requireAuth'
            className='text-f14 text-o-text-dark cursor-pointer'
          >
            Require introspect authorization
          </label>
        </div>
      </div>

      <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button
          type='submit'
          title='Import'
          loading={loading}
          containerStyle='!w-[100px]'
          disabled={incorrect || loading}
          small
        />
      </div>
    </form>
  )
}

export default ImportSpecModal
