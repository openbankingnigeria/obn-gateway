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
  titleStyle
}: ButtonProps) => {
  
  const { pending } = useFormStatus();

  return (
    <button 
      type={type || 'button'}
      onClick={effect}
      disabled={disabled || pending || loading}
      className={`group gap-[6px] flex items-center justify-center rounded-[6px]
      ${small ? 'py-[6px] px-[12px]' : 'py-[12px] px-[20px]'} 
      ${outlined ? 'outlined-button' : 'default-button'}
      ${containerStyle}`}
    >
      {
        (pending || loading) ?
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