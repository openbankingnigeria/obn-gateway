'use client'

import { RequestMethodText } from '@/app/(webapp)/(components)'
import { ApiPermissionSelectorProps } from '@/types/webappTypes/appTypes'
import React from 'react'

const ApiPermissionSelector = ({
  name,
  options,
  values,
  changeValues
}: ApiPermissionSelectorProps) => {
  const handleSelect = (id: string) => {
    if (values?.find(value => value == id)) {
      const filteredValue = values?.filter(value => value != id);
      changeValues(filteredValue);
    } else {
      changeValues(prev => [...prev, id]);
    }
  };

  return (
    <section className='ml-[16px] w-full flex flex-col'>
      {
        options?.map((data: any) => (
          <div
            key={data?.id}
            onClick={() => handleSelect(data?.id)}
            className='w-full px-[24px] py-[12px] flex items-center justify-between'
          >
            <div className='w-fit flex items-center text-[#475467] text-f14'>
              <span className='text-f12 uppercase'>
                <RequestMethodText 
                  method={data?.method}
                  styles={'w-fit'}
                />
              </span> &#160;

              {data?.label}
            </div>

            {
              values?.find(id => id == data?.id) ?
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 4C0 1.79086 1.79086 0 4 0H14C16.2091 0 18 1.79086 18 4V14C18 16.2091 16.2091 18 14 18H4C1.79086 18 0 16.2091 0 14V4Z" fill="#459572"/>
                  <path d="M6.51957 8.85041C6.32431 8.65515 6.00772 8.65515 5.81246 8.85041C5.6172 9.04567 5.6172 9.36225 5.81246 9.55752L7.62736 11.3724C7.82263 11.5677 8.13921 11.5677 8.33447 11.3724L12.6307 7.07621C12.8259 6.88095 12.8259 6.56436 12.6307 6.3691C12.4354 6.17384 12.1188 6.17384 11.9236 6.3691L7.98092 10.3118L6.51957 8.85041Z" fill="white"/>
                </svg>
                :
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.5 4C0.5 2.067 2.067 0.5 4 0.5H14C15.933 0.5 17.5 2.067 17.5 4V14C17.5 15.933 15.933 17.5 14 17.5H4C2.067 17.5 0.5 15.933 0.5 14V4Z" stroke="#E6E7EB" fill='transparent' />
                </svg>
            }
          </div>
        ))
      }
    </section>
  )
}

export default ApiPermissionSelector