'use client'

import { MultipleSelectOptions } from '@/app/(webapp)/(components)';
import { SearchBar } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { AddAPIPermissionsProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'

const AddAPIPermissions = ({
  close,
  data,
  next,
  loading,
  searchQuery,
  api_ids,
  setApiIds
}: AddAPIPermissionsProps) => {
  const apis_list = data;
  const incorrect = api_ids?.length <= 0;

  return (
    <form
      onSubmit={(e) => next('', e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <div className='w-full text-f14 text-o-text-medium3'>
          You are about to approve this API consumer’s access. 
          Select the APIs you want to grant this user access to.
        </div>
        
        <div className='flex relative flex-col w-full'>
          <div className='w-full'>
            <SearchBar 
              placeholder='Search APIs'
              name='search_apis'
              searchQuery={searchQuery}
              containerStyle='!w-full'
              big
            />
          </div>
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
          title='Approve'
          containerStyle='!w-[81px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default AddAPIPermissions