'use client'

import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { CreateRolePageProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
import { PermissionCard } from '.'
import { dataToPermissions } from '@/utils/dataToPermissions'

const CreateRolePage = ({
  close,
  data,
  next,
  loading,
  role_name,
  description,
  permissions,
  setRoleName,
  setDescription,
  setPermissions
}: CreateRolePageProps) => {
  const ROLES_PERMISSIONS = dataToPermissions(data);
  const [deselectOptions, setDeselectOptions] = useState(false);

  const incorrect = (
    !role_name ||
    !description ||
    ( permissions && 
      permissions?.length <= 0 
    )
  );

  let allPermission = ROLES_PERMISSIONS?.map((data: any) => {
    return({
      permission: data?.value,
      options: data?.permission_options
    })
  })

  // console.log(allPermission, permissions);

  const handleSelectAll = () => {
    if (permissions?.length == ROLES_PERMISSIONS?.length) { 
      setPermissions([]);
      setDeselectOptions(true);
    } else {
      setPermissions(allPermission);
      setDeselectOptions(false);
    }
  }

  return (
    <form
      // onSubmit={(e) => next('', e)}
      onSubmit={(e) => next(e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <InputElement 
          name='role_name'
          type='role_name'
          placeholder='Role name'
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
          placeholder='Role description'
          required
          label='Description'
        />

        <div className='w-full flex flex-col gap-[12px]'>
          <div className='w-full flex items-center justify-between'>
            <h3 className='text-f14 font-[600] text-o-text-medium2'>
              Permissions
            </h3>

            <div 
              className='w-fit text-f14 font-[500] text-o-green2 cursor-pointer'
              onClick={handleSelectAll}
            >
              Select All
            </div>
          </div>

          <div className='flex flex-col w-full gap-[16px]'>
            {
              ROLES_PERMISSIONS?.map((data) => (
                <PermissionCard
                  key={data?.value} 
                  label={data?.label}
                  value={data?.value}
                  permissions={permissions}
                  options={data?.permission_options}
                  deselectOptions={deselectOptions}
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
          loading={loading}
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