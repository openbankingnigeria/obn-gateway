'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PanelContainerProps } from '@/types/webappTypes/componentsTypes'
import { deleteSearchParams, updateSearchParams } from '@/utils/searchParams';
import { useRouter } from 'next/navigation';

const TransparentPanel = ({
  panel,
  currentValue,
  containerStyle
}: PanelContainerProps) => {
  const router = useRouter();
  
  const handleClick = (value: string) => {
    if (value) {
      const url = updateSearchParams('path', value);
      router.push(url)
    } else {
      const url = deleteSearchParams('path');
      router.push(url)
    }
  };

  return (
    <div className={`overflow-x-auto overflow-y-hidden border-b-[2px] border-[#DCE3EB] 
      flex items-center gap-[16px] h-[38px] w-full ${containerStyle}`}
    >
      {
        panel?.map((data) => (
          <div 
            key={data?.id} 
            className='whitespace-nowrap cursor-pointer relative w-fit flex flex-col py-[9px]'
            onClick={() => handleClick(data?.value)}
          >
            <div className={`${currentValue == data?.value ? 'text-o-blue font-[500]' : 'text-o-text-medium3'} 
              capitalize text-f14 hover:text-o-blue`}
            >
              {data?.label}
            </div>

            {
              currentValue == data?.value &&
              <motion.div
                className='pane-underline'
                layoutId='transparent-pane-underline'
              ></motion.div>
            }
          </div>
        ))
      }
    </div>
  )
}

export default TransparentPanel