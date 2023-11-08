'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ActivateDeactivateRole = ({
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
            `Are you sure you want to deactivate this role? 
            Once deactivated, all associated members tied to 
            this role will lose access.`
            :
            `Are you sure you want to activate this role? 
            Once activated, all associated members tied to 
            this role will gain access.`
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

export default ActivateDeactivateRole