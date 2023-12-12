'use client'

import React, { useState } from 'react'
import { Loader, OutsideClicker } from '@/components/globalComponents';
import { PermissionSelectorProps } from '@/types/webappTypes/appTypes';

const PermissionSelector = ({
  placeholder,
  parentIsSelected,
  name,
  options,
  clickerStyle,
  containerStyle,
  loading,
  fieldStyle,
  optionStyle,
  values,
  changeValues
}: PermissionSelectorProps) => {
  const [open, setOpen] = useState(false);
  const getLabel = values?.map(item => item?.label);

  const handleClick = () => { 
    parentIsSelected &&
    setOpen(!open); 
  }

  const handleSelect = (value: { id: string, label: string, value: string }) => {
    if (values?.some(obj => obj?.value == value?.value)) {
      const filteredValue = values?.filter(permit => permit?.value != value?.value);
      changeValues(filteredValue);
    } else {
      changeValues(prev => [...prev, value]);
    }
  }

  return (
    <OutsideClicker 
      func={() => setOpen(false)}
      clickerStyle={`!w-fit ${clickerStyle}`}
    >
      <section className={`relative w-fit flex flex-col ${containerStyle}`}>
        <div 
          onClick={handleClick}
          className={`flex items-center justify-between w-full cursor-pointer 
          gap-[8px] bg-transparent ${fieldStyle}`}
        >
          <div
            className={`text-f14 max-w-[350px] overflow-auto border-none font-[600] flex items-center text-o-text-dark3 
            capitalize outline-none whitespace-nowrap bg-transparent`}
          >
            {
              (getLabel && getLabel.length >= 1) ?
                getLabel?.toString()?.replace(/,/g, ', ') :
                <span className='text-o-text-muted'>
                  {placeholder}
                </span>
            }
          </div>

          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 20 20" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={`min-w-[20px] transition-all ${open && 'rotate-180'}`}
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

        {
          parentIsSelected &&
          <ul
            className={`bg-white shadow-md rounded-[8px] border-o-border block
            z-[60] absolute w-[179px] min-w-fit mt-1 overflow-y-auto top-[25px] right-0
            ${ open ? `max-h-[168px] py-[4px] border` : 'max-h-0 py-0 border-0' }
            ${optionStyle}`}
          >
            { 
              loading ?
                <div className="flex justify-center p-3 items-center h-full w-full">
                  <Loader />
                </div>
                :
                (options && options?.length > 0) ? 
                  options?.map((item, index) => (
                    <li
                      key={index}
                      className={`cursor-pointer px-4 py-2 truncate w-full text-f14 text-o-text-dark hover:bg-o-bg2
                      flex-row flex items-center capitalize gap-[12px] ${
                      values?.includes(item?.id) && 'bg-o-bg2'
                    }`}
                      onClick={() => handleSelect({
                        id: item?.id,
                        label: item?.label,
                        value: item?.value
                      })}
                    >
                      {
                        values?.some(obj => obj?.id == item?.id) ?
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 4C0 1.79086 1.79086 0 4 0H14C16.2091 0 18 1.79086 18 4V14C18 16.2091 16.2091 18 14 18H4C1.79086 18 0 16.2091 0 14V4Z" fill="#459572"/>
                            <path d="M6.51957 8.85041C6.32431 8.65515 6.00772 8.65515 5.81246 8.85041C5.6172 9.04567 5.6172 9.36225 5.81246 9.55752L7.62736 11.3724C7.82263 11.5677 8.13921 11.5677 8.33447 11.3724L12.6307 7.07621C12.8259 6.88095 12.8259 6.56436 12.6307 6.3691C12.4354 6.17384 12.1188 6.17384 11.9236 6.3691L7.98092 10.3118L6.51957 8.85041Z" fill="white"/>
                          </svg>
                          :
                          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 4C0.5 2.067 2.067 0.5 4 0.5H14C15.933 0.5 17.5 2.067 17.5 4V14C17.5 15.933 15.933 17.5 14 17.5H4C2.067 17.5 0.5 15.933 0.5 14V4Z" stroke="#E6E7EB" fill='transparent' />
                          </svg>
                      }

                      <span className='capitalize'>
                        {item?.label}
                      </span>
                    </li>
                  )) 
                  : 
                  <div className="flex whitespace-nowrap justify-center text-b5 text-o-text-dark p-3 items-center h-full w-full">
                    No { name?.replace(/_/g, ' ') || 'data' } at the moment
                  </div>
            }
          </ul>
        }
      </section>
    </OutsideClicker>
  )
}

export default PermissionSelector