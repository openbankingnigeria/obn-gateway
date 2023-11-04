import { RequestMethodTextProps } from '@/types/webappTypes/componentsTypes'
import React from 'react'

const RequestMethodText = ({
  method
}: RequestMethodTextProps) => {
  const sanitizedMethod = method?.toUpperCase();
  return (
    sanitizedMethod == 'GET' ?
      <div className='text-[#008000]'>
        {sanitizedMethod}
      </div>
      :
      sanitizedMethod == 'POST' ?
        <div className='text-[#FF4500]'>
          {sanitizedMethod}
        </div>
        :
        sanitizedMethod == 'PUT' ?
          <div className='text-[#0000FF]'>
            {sanitizedMethod}
          </div>
          :
          null
  )
}

export default RequestMethodText