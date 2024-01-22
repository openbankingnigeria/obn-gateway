import { RequestMethodTextProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'

const RequestMethodText = ({
  method,
  styles
}: RequestMethodTextProps) => {
  const sanitizedMethod = method?.toUpperCase();
  return (
    sanitizedMethod == 'GET' ?
      <div className={`${styles} text-[#008000]`}>
        {sanitizedMethod}
      </div>
      :
      sanitizedMethod == 'POST' ?
        <div className={`${styles} text-[#FFAB1A]`}>
          {sanitizedMethod}
        </div>
        :
        sanitizedMethod == 'PATCH' ?
        <div className={`${styles} text-[#FF4500]`}>
          {sanitizedMethod}
        </div>
        :
        (sanitizedMethod == 'PUT') ?
          <div className={`${styles} text-[#0000FF]`}>
            {sanitizedMethod}
          </div>
          :
          sanitizedMethod == 'DELETE' ?
            <div className={`${styles} text-[#FF0000]`}>
              {sanitizedMethod}
            </div>
            :
            null
  )
}

export default RequestMethodText