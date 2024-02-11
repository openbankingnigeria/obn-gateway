'use client'

import { ViewData } from '@/app/(webapp)/(components)'
import { ConsumerBusinessDetailsProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ConsumerBusinessDetails = ({
  rawData
}: ConsumerBusinessDetailsProps) => {
  // console.log(rawData);
  return (
    <section className='w-full'>
      <div className='w-full overflow-hidden bg-white border border-o-border rounded-[10px] h-fit'>
          <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
            <div className='text-f16 font-[600] text-o-text-dark'>
              Business information
            </div>
          </h3>

          <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='CAC Number'
              value={rawData?.kybData?.rcNumber || rawData?.rcNumber}
            />

            <ViewData 
              label='Regulatory License'
              value={
                <a 
                  className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                  href={rawData?.kybData?.registryLicense?.file}
                  target='_blank'
                >
                  {rawData?.kybData?.registryLicense?.fileName}
                </a>
              }
            />

            <ViewData 
              label='Certificate of Incorporation'
              value={
                <a 
                  className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                  href={rawData?.kybData?.certificateOfIncorporation?.file}
                  target='_blank'
                >
                  {rawData?.kybData?.certificateOfIncorporation?.fileName}
                </a>
              }
            />

            <ViewData 
              label='Tax Identification Number (TIN)'
              value={rawData?.kybData?.taxIdentificationNumber}
            />

            <ViewData 
              label='Company Status Report'
              value={
                <a 
                  className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'
                  href={rawData?.kybData?.companyStatusReport?.file}
                  target='_blank'
                >
                  {rawData?.kybData?.companyStatusReport?.fileName}
                </a>
              }
            />
          </div>
        </div>
    </section>
  )
}

export default ConsumerBusinessDetails