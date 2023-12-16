'use client'

import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { CreateRolePageProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { PermissionCard } from '.'
import { dataToPermissions } from '@/utils/dataToPermissions'

const EditRolePage = ({
  close,
  data,
  list,
  next,
  loading,
  role_name,
  description,
  permissions,
  setRoleName,
  setDescription,
  setPermissions
}: CreateRolePageProps) => {
  const ROLES_PERMISSIONS = dataToPermissions(list);
  // const details = EDIT_ROLE_DETAILS;
  // const [members, setMembers] = useState<MemberCardProps[]>([...details.members])

  const incorrect = (
    !role_name ||
    !description
  );

  return (
    <form
    onSubmit={(e) => next('', e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <InputElement 
          name='role_name'
          type='role_name'
          placeholder='Role name'
          label='Role Name'
          value={role_name}
          disabled
          // changeValue={setRoleName}
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
          <h3 className='text-f14 font-[600] text-o-text-medium2'>
            Permissions
          </h3>

          <input 
            className='opacity-0 hidden'
            readOnly
            value={JSON.stringify(permissions)}
            name='permissions'
          />

          <div className='flex flex-col w-full gap-[16px]'>
            {
              ROLES_PERMISSIONS?.map((data) => (
                <PermissionCard
                  key={data?.value} 
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
                  changeMembers={setMembers}
                  members={members}
                />
              ))
            }
          </div>
        </div> */}
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
          title='Save changes'
          containerStyle='!w-[120px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default EditRolePage