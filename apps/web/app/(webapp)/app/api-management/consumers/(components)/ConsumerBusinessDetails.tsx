import { ViewData } from '@/app/(webapp)/(components)'
import { ConsumerBusinessDetailsProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ConsumerBusinessDetails = ({
  rawData
}: ConsumerBusinessDetailsProps) => {
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
              value=''
            />

            <ViewData 
              label='Regulatory License'
              value={null
                // <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                //   Regulatory-License.pdf
                // </span>
              }
            />

            <ViewData 
              label='Certificate of Incorporation'
              value={null
                // <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                //   Certificate-of-Incorporation.pdf
                // </span>
              }
            />

            <ViewData 
              label='Tax Identification Number (TIN)'
              value=''
            />

            <ViewData 
              label='Company Status Report'
              value={null
                // <span className='cursor-pointer text-f14 text-o-light-blue font-500 whitespace-nowrap'>
                //   Company-Status-Report-2023.pdf
                // </span>
              }
            />
          </div>
        </div>
    </section>
  )
}

export default ConsumerBusinessDetails