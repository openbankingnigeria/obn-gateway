'use client'

import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React from 'react'

const ApproveConsumer = ({
  close,
  loading,
  next
}: ConfirmActionProps) => {

  return (
    <div className='flex flex-col gap-[24px] w-full'>
      <div className='text-o-text-medium3 text-f14'>
        You are about to approve this API Consumer’s 
        profile. The profile will be verified and gain 
        access to the APIs assigned.
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
          title={'Yes, approve'}
          effect={() => next()}
          small
          loading={loading}
          containerStyle='!w-[126px]'
        />
      </div>
    </div>
  )
}

export default ApproveConsumer