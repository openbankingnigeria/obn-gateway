'use client'

import { postDeclineConsumer } from '@/actions/consumerActions'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { ConfirmActionProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify'

const DeclineConsumer = ({
  close,
  loading,
  next,
}: ConfirmActionProps) => {
  const [reason, setReason] = useState(''); 
  const incorrect = !reason;

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postDeclineConsumer, initialState);

  if (state?.message == 'success') {
    next();
  } else {
    toast.error(state?.message);
  }

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <div className='w-full text-f14 text-o-text-medium3'>
          Are you sure you want to decline this consumer&#39;s request 
          for access? Declining the request will deny the consumer 
          access to all APIs and services.
          <br /><br />
          Kindly state the reason for declination.
        </div>
        
        <div className='w-full'>
          <TextareaElement
            name='reason'
            rows={4}
            value={reason}
            changeValue={setReason}
            placeholder='Reason'
            required
          />
        </div>
      </div>

      <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button 
          type='submit'
          title='Yes, decline'
          containerStyle='!w-[110px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default DeclineConsumer