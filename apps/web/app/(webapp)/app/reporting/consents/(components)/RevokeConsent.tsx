'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const RevokeConsent = ({
  close,
  type,
  loading,
  next
}: ConfirmActionProps) => {

  return (
    <div className='flex flex-col gap-[24px] w-full'>
      <div className='text-o-text-medium3 text-f14'>
        Are you sure you want to revoke this consent? 
        Revoking will terminate access to customer’s 
        consented information.
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
          title={'Yes, revoke'}
          effect={() => next()}
          small
          danger
          loading={loading}
          containerStyle='!w-[110px]'
        />
      </div>
    </div>
  )
}

export default RevokeConsent