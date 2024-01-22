'use client'

import { ApiPermissionCardProps } from '@/types/webappTypes/appTypes';
import React, { useState } from 'react';
import { ApiPermissionSelector } from '.';

const ApiPermissionCard = ({
  label,
  apiIds,
  value,
  changeApiIds,
  options
}: ApiPermissionCardProps) => {
  const [openList, setOpenList] = useState(false);

  const openApisHandler = () => {
    setOpenList(prev => !prev);
  };

  return (
    <section className='w-full flex flex-col gap-[12px] items-center'>
      <div 
        onClick={openApisHandler}
        className='w-full justify-between flex items-center cursor-pointer gap-[8px]'
      >
        <div className='w-fit capitalize text-[#101828] font-[500] whitespace-nowrap text-f14'>
          {label}
        </div>

        <div className='w-fit flex items-center gap-[8px]'>
          <span className='text-f12 text-[#667085]'>
            0 selected
          </span>

          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`min-w-[20px] transition-all ${openList && 'rotate-180'}`}
          >
            <path 
              d="M5 7.5L10 12.5L15 7.5" 
              stroke="#818898" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill='transparent'
            />
          </svg>
        </div>
      </div>

      {
        openList && (
          <ApiPermissionSelector 
            name={value}
            options={options}
            values={apiIds}
            changeValues={changeApiIds}
          />
        )
      }
    </section>
  )
}

export default ApiPermissionCard