'use client'

import TextareaElement from '@/components/forms/TextareaElement';
import { Button } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes';
import React, { useEffect } from 'react'

const DeclineConsumer = ({
  close,
  reason,
  setReason,
  loading,
  next
}: ConfirmActionProps) => {

  const incorrect = !reason;
  
  useEffect(() => {
    setReason && setReason('');
  }, []);

  return (
    <div className='flex flex-col gap-[24px] w-full'>
      <div className='flex flex-col w-full gap-[16px]'>
        <div className='text-o-text-medium3 text-f14'>
          You are about to reject this API Consumer’s profile, 
          enter the reason for this action.
        </div>

        <div className='w-full'>
          <TextareaElement
            name='reason'
            rows={4}
            value={reason}
            changeValue={setReason}
            placeholder='Enter reason for this action'
            required
          />
        </div>
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
          title={'Yes, reject'}
          effect={() => next()}
          danger
          small
          disabled={incorrect}
          loading={loading}
          containerStyle='!w-[126px]'
        />
      </div>
    </div>
  )
}

export default DeclineConsumer