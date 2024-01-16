'use client'

import { Button } from '@/components/globalComponents'
import React from 'react'

const EditPermissionButton = () => {
  return (
    <div className='w-fit'>
      <Button 
        title='Edit permissions'
        small
        effect={() => null}
      />
    </div>
  )
}

export default EditPermissionButton