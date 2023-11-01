'use client'

import { OutsideClicker } from '@/components/globalComponents'
import { ActionsSelectorProps } from '@/types/webappTypes/componentsTypes';
import React, { useState } from 'react'

const ActionsSelector = ({
  containerStyle,
  medium,
  small,
  fieldStyle,
  leftIcon,
  optionStyle,
  label,
  rightIcon,
  options
}: ActionsSelectorProps) => {
  const [open, setOpen] = useState(false);

  return (
    <OutsideClicker 
      func={() => setOpen(false)}
      clickerStyle='!w-fit'
    >
      <section className={`relative w-full flex flex-col ${containerStyle}`}>
      <div 
        onClick={() => setOpen(prev => !prev)}
        className={`flex items-center justify-between w-full cursor-pointer
        ${medium ? 'py-[8px] px-[10px]' : small ? 'py-[6px] px-[8px]' : 'py-[12px] px-[14px]'} 
        rounded-[6px] border gap-[8px] bg-white border-o-border
        ${fieldStyle}`}
        >
          {leftIcon}

          <div
            className={`text-f14 w-full border-none flex font-[500] items-center whitespace-nowrap
            text-o-text-dark2 capitalize outline-none bg-transparent`}
          >
            {label || 'Actions'}
          </div>

          {
            rightIcon ||
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
          }
        </div>

        <div className={`absolute bg-white rounded-lg flex-col z-10 overflow-y-auto 
          border-o-border right-0 top-[40px] min-w-fit w-full items-start 
          justify-start tablemenu-boxshadow 
          ${ open ? `max-h-60 py-[4px] border` : 'max-h-0 py-0 border-0'} 
          ${optionStyle}`}
        >
          {options}
        </div>
      </section>
    </OutsideClicker>
  )
}

export default ActionsSelector