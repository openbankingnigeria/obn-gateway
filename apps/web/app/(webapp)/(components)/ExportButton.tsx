'use client'

import { Button } from '@/components/globalComponents'
import { ExportButtonProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'
import { useExportExcel } from '@/hooks'

const ExportButton = ({
  name,
  module
}: ExportButtonProps) => {
  const [loadingExport, handleExport] = useExportExcel(module);

  return (
    <div className='w-fit'>
      <Button 
        title={name || 'Export data'}
        // @ts-ignore
        effect={handleExport}
        small
        outlined
        containerStyle='!w-[123px]'
        titleStyle='!font-[500]'
        // @ts-ignore
        loading={loadingExport}
        leftIcon={
          <svg width="20" height="20" className='min-w-[20px]' viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.5 12.5V13.5C17.5 14.9001 17.5 15.6002 17.2275 16.135C16.9878 16.6054 16.6054 16.9878 16.135 17.2275C15.6002 17.5 14.9001 17.5 13.5 17.5H6.5C5.09987 17.5 4.3998 17.5 3.86502 17.2275C3.39462 16.9878 3.01217 16.6054 2.77248 16.135C2.5 15.6002 2.5 14.9001 2.5 13.5V12.5M14.1667 8.33333L10 12.5M10 12.5L5.83333 8.33333M10 12.5V2.5" stroke="#666D80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill='transparent'/>
          </svg>
        }
      />
    </div>
  )
}

export default ExportButton