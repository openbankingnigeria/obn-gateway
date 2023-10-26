'use client'

import React from 'react'
import { LinkButtonProps } from '@/types/componentsTypes/globalComponents'
import Link from 'next/link';

const LinkButton = ({
  title,
  type,
  leftIcon,
  rightIcon,
  path,
  containerStyle,
  small,
  outlined
}: LinkButtonProps) => {
  return (
    <Link 
      type={type || 'button'}
      href={path}
      className={`gap-[6px] flex items-center justify-center rounded-[6px]
      ${small ? 'py-[6px] px-[12px]' : 'py-[12px] px-[20px]'} 
      ${outlined ? 'outlined-button' : 'default-button'}
      default-button ${containerStyle}`}
    >
      {leftIcon}

      <div className='text-f14 font-[600]'>
        {title}
      </div>

      {rightIcon}
    </Link>
  )
}

export default LinkButton