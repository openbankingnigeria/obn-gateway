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

      const result: ImportResultDataProps = await clientAxiosRequest({
        headers: { 'Content-Type': 'multipart/form-data' },
        apiEndpoint: API.postImportAPISpec({ environment }),
        method: 'POST',
        data: formData,
      })

      setLoading(false)

      if (result?.importId) {
        toast.success(
          `Successfully imported ${result.successCount} of ${result.totalEndpoints} endpoints${
            result.failedCount > 0 ? ` (${result.failedCount} failed)` : ''
          }`
        )
        close()
        router.refresh()
      }
    } catch (error: any) {
      setLoading(false)
      toast.error(error?.message || 'Failed to import specification')
    }
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
