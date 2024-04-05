'use client' 

import { Loader } from '@/components/globalComponents';
import React, { ReactNode, useState } from 'react'

interface ViewDataProps {
  label: string;
  value: ReactNode | string
  loading?: boolean;
  masked?: boolean;
}

const ViewData = ({
  label,
  value,
  loading,
  masked
}: ViewDataProps) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <section className='w-full flex flex-col gap-[4px]'>
      <h4 className='capitalize text-f12 font-[500] text-o-text-muted'>
        {label}
      </h4>

      <div className='text-f14 font-[500] text-o-text-dark3'>
        {
          loading ?
            <Loader />
            :
            !masked ?
              value :
              <div className='w-full flex items-start gap-[5px]'>
                  {showPass ? value : '***********'} 
                  <div
                    className='text-p-input-medium text-f24 mb-[2px] cursor-pointer'
                    onClick={() => setShowPass((prev) => !prev)}
                  >
                  {
                    !showPass ?
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                          d="M1.75 10C1.75 10 4.75 4 10 4C15.25 4 18.25 10 18.25 10C18.25 10 15.25 16 10 16C4.75 16 1.75 10 1.75 10Z" 
                          stroke="#818898" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill='transparent'
                        />
                        <path 
                          d="M10 12.25C11.2426 12.25 12.25 11.2426 12.25 10C12.25 8.75736 11.2426 7.75 10 7.75C8.75736 7.75 7.75 8.75736 7.75 10C7.75 11.2426 8.75736 12.25 10 12.25Z" 
                          stroke="#818898" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill='transparent'
                        />
                      </svg>
                      :
                        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path 
                            d="M8.95245 4.95673C9.29113 4.90666 9.64051 4.8798 10.0003 4.8798C14.2545 4.8798 17.0461 8.63384 17.9839 10.1188C18.0974 10.2986 18.1542 10.3884 18.1859 10.527C18.2098 10.6311 18.2098 10.7954 18.1859 10.8994C18.1541 11.0381 18.097 11.1285 17.9827 11.3094C17.7328 11.7049 17.3518 12.2607 16.8471 12.8635M5.6036 6.309C3.80187 7.53122 2.57871 9.22928 2.01759 10.1175C1.90357 10.298 1.84656 10.3883 1.81478 10.5269C1.79091 10.631 1.7909 10.7952 1.81476 10.8993C1.84652 11.0379 1.90328 11.1277 2.01678 11.3075C2.95462 12.7924 5.74618 16.5465 10.0003 16.5465C11.7157 16.5465 13.1932 15.9361 14.4073 15.1103M2.50035 3.21313L17.5003 18.2131M8.23258 8.94537C7.78017 9.39778 7.50035 10.0228 7.50035 10.7131C7.50035 12.0938 8.61963 13.2131 10.0003 13.2131C10.6907 13.2131 11.3157 12.9333 11.7681 12.4809" 
                            stroke="#818898" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            fill='transparent'
                          />
                        </svg>
                  }
                </div>
              </div>
        }
      </div>
    </section>
  )
}

export default ViewData