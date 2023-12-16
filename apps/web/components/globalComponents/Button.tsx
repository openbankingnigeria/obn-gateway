'use client'

import React from 'react'
// @ts-ignore
import { experimental_useFormStatus as useFormStatus } from 'react-dom'
import Loader from './Loader'
import { ButtonProps } from '@/types/componentsTypes/globalComponents'

const Button = ({
  title,
  type,
  leftIcon,
  rightIcon,
  effect,
  disabled,
  loading,
  outlined,
  containerStyle,
  small,
  danger,
  titleStyle
}: ButtonProps) => {
  
  const { pending } = useFormStatus();

  return (
    <button 
      type={type || 'button'}
      onClick={effect}
      disabled={type == 'submit' ? (disabled || pending || loading) : (disabled || loading)}
      className={`group gap-[6px] flex items-center justify-center rounded-[6px]
      ${small ? 'py-[6px] px-[12px]' : 'py-[12px] px-[20px]'} 
      ${outlined ? 'outlined-button' : danger ? 'bg-[#DF1C41] text-white' : 'default-button'}
      ${containerStyle}`}
    >
      {
        (type == 'submit' ? (pending || loading) : loading) ?
          <Loader lightGreen={!outlined} /> :
          <>
            {leftIcon}

            <div className={`whitespace-nowrap text-f14 font-[600] ${titleStyle}`}>
              {title}
            </div>

            {rightIcon}
          </>
      }
    </button>
  )
}

export default Button