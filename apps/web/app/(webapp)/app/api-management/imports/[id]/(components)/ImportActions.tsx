'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import * as API from '@/config/endpoints'
import axios from '@/config/axios'
import { Button } from '@/components/globalComponents'

interface ImportActionsProps {
  importId: string
  environment: string
  hasFailedEndpoints: boolean
}

export const ImportActions = ({ importId, environment, hasFailedEndpoints }: ImportActionsProps) => {
  const router = useRouter()
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const response: any = await axios({
        method: 'POST',
        url: API.retryAPIImport({ environment, id: importId }),
      })

      if (response.status === 200 || response.status === 201) {
        router.refresh()
      }
    } catch (error: any) {
      console.error('Retry error:', error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (!hasFailedEndpoints) {
    return null
  }

  return (
    <div className='flex items-center gap-[12px] pb-[20px]'>
      <Button
        title='Retry Failed Endpoints'
        effect={handleRetry}
        loading={isRetrying}
        containerStyle='!w-fit'
      />
    </div>
  )
}
