'use client'

import { MultipleSelectOptionsProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'

const MultipleSelectOptions = ({
  options,
  selected,
  changeSelected,
  searchQuery,
  containerStyle
}: MultipleSelectOptionsProps) => {

  const handleChanges = (value: string) => {
    if (selected?.includes(value)) {
      let newSelected = selected?.filter(item => item != value);
      changeSelected([...newSelected])
    } else {
      changeSelected([...selected, value])
    }
  }

  return (
    <ul className={`list-none w-full flex flex-col gap-[8px] py-[8px] overflow-y-auto overflow-x-hidden 
      rounded-[6px] multiple-options-boxshadow bg-white max-h-[320px] h-fit ${containerStyle}`}
    >
      {
        options.map((option) => (
          <li 
            key={option?.id}
            onClick={() => handleChanges(option?.value)}
            className={`px-[16px] cursor-pointer hover:bg-[#FCFDFD] py-[10px] hidden items-center justify-between gap-[5px]
            ${option?.label?.includes(searchQuery) && '!flex'}`}
          >
            <div className='text-o-text-darkest text-f14 '>
              {option?.label}
            </div>

            {
              selected?.includes(option?.value) ?
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7C4.79086 21 3 19.2091 3 17V7Z" fill="#459572"/>
                <path d="M8.28033 11.7756C7.98744 11.4827 7.51256 11.4827 7.21967 11.7756C6.92678 12.0685 6.92678 12.5434 7.21967 12.8363L9.94202 15.5586C10.2349 15.8515 10.7098 15.8515 11.0027 15.5586L17.447 9.11431C17.7399 8.82142 17.7399 8.34655 17.447 8.05365C17.1541 7.76076 16.6792 7.76076 16.3863 8.05365L10.4724 13.9676L8.28033 11.7756Z" fill="white"/>
              </svg>
              :
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 7C3.5 5.067 5.067 3.5 7 3.5H17C18.933 3.5 20.5 5.067 20.5 7V17C20.5 18.933 18.933 20.5 17 20.5H7C5.067 20.5 3.5 18.933 3.5 17V7Z" stroke="#E6E7EB" fill='transparent'/>
              </svg>
            }
          </li>
        ))
      }
    </ul>
  )
}

export default MultipleSelectOptions