'use client'

import { postApproveConsumer } from '@/actions/consumerActions';
import { MultipleSelectOptions, SelectedItem } from '@/app/(webapp)/(components)';
import { SearchBar } from '@/components/forms';
import { Button, OutsideClicker } from '@/components/globalComponents';
import { ConfirmActionProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const ApproveConsumer = ({
  close,
  loading,
  dataList,
  searchQuery,
  next,
}: ConfirmActionProps) => {
  const [openList, setOpenList] = useState(false);
  const [apis, setAPIs] = useState([]); 
  const incorrect = apis?.length < 1;

  const apis_list = dataList || [];

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postApproveConsumer, initialState);

  if (state?.message == 'success') {
    next();
  } else {
    toast.error(state?.message);
  }

  const handleRemoveApi = (value: string) => {
    let newSelected = apis?.filter(item => item != value);
    setAPIs([...newSelected])
  }

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[80%] overflow-auto gap-[16px] w-full px-[20px]'>
        <div className='w-full text-f14 text-o-text-medium3'>
          You are about to approve this API consumer’s access. 
          Select the APIs you want to grant this user access to.
        </div>
        
        <div className='flex relative flex-col gap-[5px] w-full'>
          <div 
            className='w-full'
            onClick={() => setOpenList(prev => !prev)}
          >
            <SearchBar 
              placeholder='Search APIs'
              name='search_apis'
              searchQuery={searchQuery}
              containerStyle='!w-full'
              big
            />
          </div>

          {
            (openList) &&
            <OutsideClicker
              func={() => setOpenList(false)}
            >
              <MultipleSelectOptions 
                selected={apis}
                searchQuery={searchQuery}
                changeSelected={(value: any) => setAPIs(value)}
                options={apis_list}
                containerStyle='absolute top-[55px]'
              />
            </OutsideClicker>
          }
        </div>

        <div className='w-full flex items-center flex-wrap gap-[12px]'>
          {
            apis?.map((api) => (
              <SelectedItem 
                key={api}
                effect={() => handleRemoveApi(api)}
                label={api}
              />
            ))
          }
        </div>
      </div>

      <div className='px-[20px] w-full min-h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <input 
          name='apis' 
          value={apis} 
          readOnly
          className='hidden opacity-0' 
        />

        <Button 
          type='submit'
          title='Approve'
          containerStyle='!w-[81px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default ApproveConsumer