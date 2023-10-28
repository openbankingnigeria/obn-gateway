'use client'

import { greaterThan8, validateLowercase, validateNumber, validateSymbol, validateUppercase } from '@/utils/globalValidations';
import { PASSWORD_DATA } from '@/data/passwordData';
import { InputElementProps } from '@/types/componentsTypes/forms'
import React, { ChangeEvent, useEffect, useState } from 'react'

const InputElement = ({
  placeholder,
  medium,
  small,
  required,
  label,
  type,
  maxLength,
  name,
  autoComplete,
  leftIcon,
  rightIcon,
  showGuide,
  disabled,
  containerStyle,
  labelStyle,
  fieldStyle,
  invalid,
  value,
  changeValue,
  hint
}: InputElementProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPass, setShowPass] = useState(true);

  const [hasUpperAndLowercase, setHasUpperAndLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [has8Characters, setHas8Characters] = useState(false);
  const [hasSpecialCharacters, setHasSpecialCharacters] = useState(false);

  const upperAndLowerCase = value && validateUppercase(value) && validateLowercase(value);
  const number = value && validateNumber(value);
  const symbol = value && validateSymbol(value);
  const passwordLength = value && greaterThan8(value);

  useEffect(() => {
    upperAndLowerCase ? setHasUpperAndLowercase(true) : setHasUpperAndLowercase(false);
    number ? setHasNumber(true) : setHasNumber(false);
    passwordLength ? setHas8Characters(true) : setHas8Characters(false);
    symbol ? setHasSpecialCharacters(true) : setHasSpecialCharacters(false);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    changeValue && changeValue(e.target.value);
  }

  return (
    <section className={`w-full flex flex-col ${containerStyle}`}>
      {
        label &&
        <label className={`text-o-text-medium2 mb-[4px] text-f14 font-[500] ${labelStyle}`}>
          {label}
          {
            !required &&
            <span>{' (optional)'}</span>
          }
        </label>
      }

      <div className={`flex items-center justify-between w-full 
        ${medium ? 'py-[8px] px-[10px]' : small ? 'py-[6px] px-[8px]' : 'py-[12px] px-[14px]'} 
        rounded-[6px] border gap-[8px] ${disabled ? 'bg-o-bg-disabled' : 'bg-white'} 
        ${isFocused ? 'input-focus' : invalid ? 'input-error' : 'border-o-border'}
        ${fieldStyle}`}
      >
        {leftIcon}

        <input
          placeholder={placeholder}
          required={required}
          type={type ? (!showPass ? 'text' : type) : 'text'}
          maxLength={maxLength || 100}
          name={name}
          value={value}
          onChange={(e) => handleChange(e)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoComplete={autoComplete || 'nope'}
          disabled={disabled}
          className={`text-f14 w-full placeholder:text-o-text-muted border-none 
          ${disabled ? 'text-o-text-disabled' : 'text-o-text-dark2'} outline-none bg-transparent`}
        />

        {
          type=='password' &&
          <div
            className='text-p-input-medium text-f24 cursor-pointer'
            onClick={() => setShowPass((prev) => !prev)}>
            {
              showPass ?
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
        }

        {rightIcon}
      </div>

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

      {
        value && type=='password' && showGuide &&
        <div className='w-full flex flex-col mt-[16px] gap-[8px]'>
          {
            PASSWORD_DATA?.map((data) => (
              <div
                key={data?.id}
                className='w-full flex items-center gap-[8px]'
              >
                {
                  (
                    hasUpperAndLowercase && data?.type == 'upperandlowercase' ||
                    hasNumber && data?.type == 'number' ||
                    has8Characters && data?.type == 'length' ||
                    hasSpecialCharacters && data?.type == 'specialcharacter'
                  ) ?
                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_123_8819)">
                        <path 
                          d="M5.625 9.71313L7.875 11.9631L12.375 7.46313M16.5 9.71313C16.5 13.8553 13.1421 17.2131 9 17.2131C4.85786 17.2131 1.5 13.8553 1.5 9.71313C1.5 5.571 4.85786 2.21313 9 2.21313C13.1421 2.21313 16.5 5.571 16.5 9.71313Z" 
                          stroke="#56C06D" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill='transparent'
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_123_8819">
                          <rect width="18" height="18" fill="white" transform="translate(0 0.713135)"/>
                        </clipPath>
                      </defs>
                    </svg>
                    :                  
                    <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_123_8788)">
                        <path 
                          d="M5.625 9.71313L7.875 11.9631L12.375 7.46313M16.5 9.71313C16.5 13.8553 13.1421 17.2131 9 17.2131C4.85786 17.2131 1.5 13.8553 1.5 9.71313C1.5 5.571 4.85786 2.21313 9 2.21313C13.1421 2.21313 16.5 5.571 16.5 9.71313Z" 
                          stroke="#666D80" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          fill='transparent'
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_123_8788">
                          <rect width="18" height="18" fill="white" transform="translate(0 0.713135)"/>
                        </clipPath>
                      </defs>
                    </svg>
                }

                <div className='text-o-text-medium3 text-f14'>
                  {data?.label}
                </div>
              </div>
            ))
          }
        </div>
      }
    </section>
  )
}

export default InputElement