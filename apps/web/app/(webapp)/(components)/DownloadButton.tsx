'use client'

import { DOWNLOAD_OPTIONS_DATA } from '@/data/reportsData';
import { DownloadButtonProps } from '@/types/webappTypes/componentsTypes';
import React, { useState } from 'react'

const DownloadButton = ({
  containerStyle,
  data
}: DownloadButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`w-fit flex flex-col relative ${containerStyle}`}>
      {
        open &&
        <div className={`w-fit absolute right-0 top-[-140px] download-option-boxshadow 
          h-fit flex flex-col py-[4px] rounded-[8px] bg-white border 
          border-o-border`}
        >
          {
            DOWNLOAD_OPTIONS_DATA?.map(data => (
              <div
                className={`text-f14 cursor-pointer hover:bg-o-bg-disabled 
                text-o-text-dark flex items-center whitespace-nowrap 
                px-[16px] py-[10px] gap-[12px]`}
                key={data?.id}
              >
                {data?.icon}
                {data?.label}
              </div>
            ))
          }
        </div>
      }

      <div 
        onClick={() => setOpen(prev => !prev)}
        className={`max-w-[190px] px-[12px] border border-o-border py-[6px] 
        gap-[6px] flex items-center rounded-[6px] download-field`}
      >
        <div className='w-fit font-[600] text-f14 text-o-text-dark3'>
          Download
        </div>

        <svg 
          width="20" 
          height="20" 
          className={`transition-all rotate-[180deg] ${open && '!rotate-[0deg]'}`} 
          viewBox="0 0 20 20" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M15 12.5L10 7.5L5 12.5" 
            stroke="#36394A" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill='transparent' 
          />
        </svg>
      </div>
    </div>
  )
}

export default DownloadButton