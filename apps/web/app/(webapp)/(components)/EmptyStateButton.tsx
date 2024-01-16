'use client'

import { Button } from '@/components/globalComponents'
import React from 'react'

const EmptyStateButton = ({ type }: { type?: string}) => {

  const handleAddPermission = () => null;

  return (
    <div className='w-full flex justify-center mb-14 items-center'>
      {
        type == 'ADD_PERMISSIONS' ?
          <Button 
            title='Add permission'
            small
            effect={handleAddPermission}
            containerStyle='w-fit'
          />
          :
          null
      }
    </div>
  )
}

export default EmptyStateButton