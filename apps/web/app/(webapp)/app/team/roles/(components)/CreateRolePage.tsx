'use client'

import { postCreateRole } from '@/actions/teamActions'
import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { ROLES_PERMISSIONS } from '@/data/rolesData'
import { CreateRolePageProps, PermissionValue } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { PermissionCard } from '.'

const CreateRolePage = ({
  close,
  next
}: CreateRolePageProps) => {
  const [role_name, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<PermissionValue[]>([]);

  const incorrect = (
    !role_name ||
    !description
  );

  const initialState = {
    message: null,
  }

  const [state, formAction] = useFormState(postCreateRole, initialState);
  if(state?.message) {
    next();
  }

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <InputElement 
          name='role_name'
          type='role_name'
          placeholder=''
          label='Role Name'
          value={role_name}
          changeValue={setRoleName}
          required
        />

        <TextareaElement
          name='description'
          rows={3}
          value={description}
          changeValue={setDescription}
          placeholder=''
          required
          label='Description'
        />

        <div className='w-full flex flex-col gap-[12px]'>
          <h3 className='text-f14 font-[600] text-o-text-medium2'>
            Permissions
          </h3>

          <div className='flex flex-col w-full gap-[16px]'>
            {
              ROLES_PERMISSIONS?.map((data) => (
                <PermissionCard
                  key={data?.id} 
                  label={data?.label}
                  value={data?.value}
                  permissions={permissions}
                  options={data?.permission_options}
                  changePermissions={setPermissions}
                />
              ))
            }
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
          title='Create'
          containerStyle='!w-[70px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default CreateRolePage