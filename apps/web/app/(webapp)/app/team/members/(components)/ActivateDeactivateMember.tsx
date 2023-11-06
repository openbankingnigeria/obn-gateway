'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ActivateDeactivateMember = ({
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
            `Are you sure you want to deactivate this member? 
            Once deactivated, the platform will become 
            inaccessible to this member.`
            :
            `Are you sure you want to activate this member? 
            Once activated, the platform will become accessible 
            to this member.`
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

export default ActivateDeactivateMember