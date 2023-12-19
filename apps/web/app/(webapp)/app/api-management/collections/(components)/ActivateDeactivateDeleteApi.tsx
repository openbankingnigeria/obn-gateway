'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ActivateDeactivateDeleteApi = ({
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
            `Are you sure you want to deactivate this API? 
            Once deactivated, the API would be disabled.`
            :
            type == 'activate' ?
              `Are you sure you want to activate this API? 
              Once activated, the API would be enabled.`
              :
              `Are you sure you want to delete this API? 
              Once deleted, you will lose access to this API.`
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
              type == 'activate' ?
                'Yes, activate' :
                'Yes, delete'
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

export default ActivateDeactivateDeleteApi