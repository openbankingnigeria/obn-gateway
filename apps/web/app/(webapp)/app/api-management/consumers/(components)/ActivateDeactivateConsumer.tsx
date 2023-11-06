'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ActivateDeactivateConsumer = ({
  close,
  type,
  loading,
  next
}: ConfirmActionProps) => {

  return (
    <div className='flex flex-col gap-[24px] w-full'>
      <div className='text-o-text-medium3 text-f14'>
        {
          type == 'deactivate' ?
            `Deactivating will immediately revoke the consumer's 
            access to all APIs and services. 
            This action is irreversible.`
            :
            `Are you sure you want to activate this previously 
            deactivated consumer? Activating will grant the 
            consumer immediate access to all APIs and services 
            they were previously authorized for.`
        }
      </div>

      <div className='flex items-center justify-between gap-5'>
        <Button 
          title='Cancel'
          effect={close}
          outlined
          small
          containerStyle='!w-fit'
        />
        
        <Button 
          title={
            type == 'deactivate' ? 
              'Yes, deactivate' : 
              'Yes, activate'
            }
          effect={() => next()}
          small
          loading={loading}
          containerStyle='!w-[126px]'
        />
      </div>
    </div>
  )
}

export default ActivateDeactivateConsumer