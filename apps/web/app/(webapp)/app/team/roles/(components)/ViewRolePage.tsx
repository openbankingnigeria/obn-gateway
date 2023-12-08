'use client'

import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { ROLES_MEMBERS } from '@/data/rolesData'
import { CreateRolePageProps } from '@/types/webappTypes/appTypes'
import React, { useEffect, useState } from 'react'
import { RolesMemberCard } from '.'
import * as API from '@/config/endpoints';
import { dataToPermissions } from '@/utils/dataToPermissions'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'

const ViewRolePage = ({
  close,
  data,
  next
}: CreateRolePageProps) => {
  const members = ROLES_MEMBERS;
  const [permission, setPermissions] = useState<any[]>([]);

  async function FetchData() {
    const result = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getRolePermission({ id: data?.id }),
      method: 'GET',
      data: null,
      noToast: true,
    });

    let permits = dataToPermissions(result?.data?.map((data: any) => data), 'string');
    setPermissions(permits);
  }

  useEffect(() => {
    FetchData();
  }, [data])

  return (
    <section
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <InputElement 
          name='role_name'
          type='role_name'
          label='Role Name'
          disabled
          value={data?.name}
          required
        />

        <TextareaElement
          name='description'
          rows={3}
          disabled
          value={data?.description}
          required
          label='Description'
        />

        <div className='w-full flex flex-col gap-[12px]'>
          <h3 className='text-f14 font-[600] text-o-text-medium2'>
            Permissions
          </h3>

          <ul className='list-inside list-disc w-full'>
            {
              permission?.map((data) => (
                <li
                  key={data}
                  className='text-f14 capitalize text-o-text-medium3'
                >
                  {data?.replace(/,/g, ', ')}
                </li>
              ))
            }
          </ul>
        </div>

        {/* <div className='w-full flex flex-col gap-[12px]'>
          <h3 className='text-f14 font-[600] text-o-text-medium2'>
            Members <span className='font-[400]'>({members?.length})</span>
          </h3>

          <div className='w-full flex flex-col gap-[16px]'>
            {
              members?.map((member) => (
                <RolesMemberCard
                  key={member?.id} 
                  member={member}
                />
              ))
            }
          </div>
        </div> */}
      </div>

      <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          type='button'
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button 
          type='button'
          title='Edit'
          effect={next}
          containerStyle='!w-[70px]'
          small
        />
      </div>
    </section>
  )
}

export default ViewRolePage