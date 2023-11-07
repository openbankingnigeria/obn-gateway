'use client'

import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { ROLES_MEMBERS, ROLES_VIEW_PERMISSIONS } from '@/data/rolesData'
import { CreateRolePageProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { RolesMemberCard } from '.'

const ViewRolePage = ({
  close,
  next
}: CreateRolePageProps) => {
  const members = ROLES_MEMBERS;

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
          value={'Admin'}
          required
        />

        <TextareaElement
          name='description'
          rows={3}
          disabled
          value={'Administrators have full control over the API management platform.'}
          required
          label='Description'
        />

        <div className='w-full flex flex-col gap-[12px]'>
          <h3 className='text-f14 font-[600] text-o-text-medium2'>
            Permissions
          </h3>

          <ul className='list-inside list-disc w-full'>
            {
              ROLES_VIEW_PERMISSIONS?.map((data) => (
                <li
                  key={data?.id}
                  className='text-f14 text-o-text-medium3'
                >
                  {data?.label}
                </li>
              ))
            }
          </ul>
        </div>

        <div className='w-full flex flex-col gap-[12px]'>
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
        </div>
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