import { ViewData } from '@/app/(webapp)/(components)'
import React from 'react'

const ConsumerBusinessDetails = () => {
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
              label='CAC Registration Number'
              value='RC3728292929277'
            />

            <ViewData 
              label='Tax Identification Number (TIN)'
              value='38394392938488'
            />

            <ViewData 
              label='Regulatory License'
              value={
                <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                  Regulatory-License.pdf
                </span>
              }
            />

            <ViewData 
              label='Certificate of Incorporation'
              value={
                <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                  Certificate-of-Incorporation.pdf
                </span>
              }
            />

            <ViewData 
              label='Company Status Report'
              value={
                <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                  Company-Status-Report-2023.pdf
                </span>
              }
            />
          </div>
        </div>
    </section>
  )
}

export default ConsumerBusinessDetails