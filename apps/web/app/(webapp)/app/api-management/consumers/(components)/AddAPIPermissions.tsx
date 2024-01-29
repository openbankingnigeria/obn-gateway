'use client'

import { SearchBar } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { AddAPIPermissionsProps } from '@/types/webappTypes/appTypes'
import React, { useEffect, useState } from 'react'
import { ApiPermissionCard } from '.';
import { ApiPermissionArrayItem } from '@/types/utilTypes';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';

const AddAPIPermissions = ({
  close,
  data,
  next,
  setRefresh,
  loading,
  searchQuery,
  api_ids,
  setApiIds
}: AddAPIPermissionsProps) => {
  const environment = 'development';
  const incorrect = api_ids?.length <= 0;
  const [api_list, setApiList] = useState<ApiPermissionArrayItem[]>([]);

  const dataToApiPermissions = (array: any[]) => {
    array?.forEach(async(item: any) => {
      const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.getAPIs({
          page: `1`,
          limit: `100`,
          collectionId: item?.id,
          environment,
        }),
        method: 'GET',
        data: null,
        noToast: true
      });
  
      let apis = result?.data?.map((api: any) => {
        return({
          method: api?.downstream?.methods?.toString(),
          id: api?.id,
          label: api?.name
        });
      });
  
      setApiList(prev => {
        const isDuplicate = prev.some((existingItem) => existingItem.value === item?.id);
        if (!isDuplicate) {
          return [
            ...prev,
            { label: item?.name,
              value: item?.id,
              api_options: apis, 
            },
          ];
        }
        return prev;
      });
    });
  }

  useEffect(() => {
    dataToApiPermissions(data)
  }, [])

  return (
    <form
      onSubmit={(e) => next('', e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col gap-[16px] w-full px-[20px]'>
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

      <div className='px-[20px] overflow-auto flex h-[calc(100%-210px)] flex-col w-full gap-[12px]'>
        {
          api_list?.map((data: any) => (
            <ApiPermissionCard
              key={data?.value} 
              label={data?.label}
              value={data?.value}
              apiIds={api_ids}
              options={data?.api_options}
              changeApiIds={setApiIds}
            />
          ))
        }
      </div>

      <div className='px-[20px] w-full pb-[20px] h-[70px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button 
          type='submit'
          loading={loading}
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