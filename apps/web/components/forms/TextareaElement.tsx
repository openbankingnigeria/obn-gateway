'use client'

import { TextareaElementProps } from '@/types/componentsTypes/forms'
import React, { ChangeEvent, useState } from 'react'

const TextareaElement = ({
  placeholder,
  medium,
  small,
  required,
  label,
  name,
  disabled,
  containerStyle,
  labelStyle,
  fieldStyle,
  invalid,
  value,
  changeValue,
  rows,
  hint
}: TextareaElementProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    changeValue && changeValue(e.target.value);
  }

  return (
    <section className={`w-full flex flex-col ${containerStyle}`}>
      {
        label &&
        <label className={`text-o-text-medium2 mb-[4px] text-f14 font-[500] ${labelStyle}`}>
          {label}
        </label>
      }

      <textarea 
        id={name}
        name={name}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        rows={rows || 4}
        className={`flex items-center justify-between w-full resize-none 
        ${medium ? 'py-[8px] px-[10px]' : small ? 'py-[6px] px-[8px]' : 'py-[12px] px-[14px]'} 
        text-f14 placeholder:text-o-text-muted outline-none rounded-[6px] border gap-[8px] 
        ${disabled ? 'text-o-text-disabled bg-o-bg-disabled' : 'text-o-text-dark2 bg-white'} 
        ${isFocused ? 'input-focus' : invalid ? 'input-error' : 'border-o-border'}
        ${fieldStyle}`}
      ></textarea>

      {
        hint &&
        <div className={`text-f12 flex items-center mt-[6px] gap-[4px]  ${
          invalid ? 'text-[#DF1C41]' :
            disabled ? 'text-o-text-disabled' :
            'text-o-text-medium3'
        }`}>
          {
            invalid &&
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path 
                d="M1.83337 7.99999C1.83337 4.59424 4.59429 1.83333 8.00004 1.83333C11.4058 1.83333 14.1667 4.59424 14.1667 8C14.1667 11.4058 11.4058 14.1667 8.00004 14.1667C4.59428 14.1667 1.83337 11.4057 1.83337 7.99999Z" 
                fill="#FFF0F3"
              />
              <path 
                d="M8.00004 8.66666L8.00004 5.16666M1.83337 7.99999C1.83337 4.59424 4.59429 1.83333 8.00004 1.83333C11.4058 1.83333 14.1667 4.59424 14.1667 8C14.1667 11.4058 11.4058 14.1667 8.00004 14.1667C4.59428 14.1667 1.83337 11.4057 1.83337 7.99999Z" 
                stroke="#DF1C41" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill='transparent'
              />
              <path 
                d="M7.99996 11.25C8.32213 11.25 8.58329 10.9888 8.58329 10.6667C8.58329 10.3445 8.32213 10.0833 7.99996 10.0833C7.67779 10.0833 7.41663 10.3445 7.41663 10.6667C7.41663 10.9888 7.67779 11.25 7.99996 11.25Z" 
                fill="#DF1C41" 
                stroke="#DF1C41" 
                strokeWidth="0.5"
              />
            </svg>
          }

          {hint}
        </div>
      }
    </section>
  )
}

export default TextareaElement;