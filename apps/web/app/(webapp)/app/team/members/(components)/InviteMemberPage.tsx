'use client'

import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { InviteMembersProps } from '@/types/webappTypes/appTypes'
import { dataToPermissions } from '@/utils/dataToPermissions'
import React, { useEffect, useState } from 'react'
import * as API from '@/config/endpoints';
import { validateEmail } from '@/utils/globalValidations'

const InviteMemberPage = ({
  roles,
  close,
  email,
  role,
  setEmail,
  setRole,
  next,
  loading
}: InviteMembersProps) => {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [show_role, setShowRole] = useState(false);

  async function FetchData(id: string) {
    const result: any = id && await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getRolePermission({ id: id }),
      method: 'GET',
      data: null,
      noToast: true
    });

    let permits = dataToPermissions(result?.data?.map((data: any) => data), 'string');
    setPermissions(permits);
  }

  useEffect(() => {
    let role_details = roles?.find(data => data?.id == role);
    FetchData(role_details?.id);
  }, [role, FetchData, roles])

  const incorrect = (
    !role ||
    !validateEmail(email)
  );

  const roles_list = roles.map(data => {
    return ({
      label: data?.name,
      value: data?.id
    })
  })

  const handleShowRole = () => {
    setShowRole(prev => !prev);
  };

  return (
    <form
      // onSubmit={(e) => next('', e)}
      onSubmit={(e) => next(e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <InputElement 
          name='email'
          type='email'
          placeholder='Email address'
          label='Email Address'
          value={email}
          changeValue={setEmail}
          required
        />

        <div className='w-full flex items-center gap-[16px]'>
          <>
            <input 
              name='role'
              value={role}
              readOnly
              className='opacity-0 hidden'
            />

            <SelectElement 
              name='role'
              // @ts-ignore
              options={roles_list}
              btnTitle='Create Role'
              emptyState={'No role at the moment, kindly create a role to start inviting members'}
              btnPath='/app/team/roles'
              required
              placeholder='Select role'
              optionStyle='top-[72px]'
              label='Role'
              clickerStyle='!w-full'
              value={role}
              changeValue={setRole}
            />
          </>

          <button
            onClick={handleShowRole}
            type='button'
            className='px-[8px] py-[6px] min-w-[140px] mt-5 whitespace-nowrap flex justify-end text-o-status-green font-[600] text-f14'
          >
            {
              show_role ? 
                'Hide role details' :
                'Show role details' 
            }
          </button>
        </div>

        {
          role && show_role &&
            <div className='w-full p-[20px] rounded-[8px] bg-o-bg2 flex gap-[12px] flex-col'>
              <h3 className='text-o-text-dark text-f14 font-[600]'>
                Role&#39;s Permissions              
              </h3>

              <ul className='capitalize list-disc pl-[26px] text-o-text-medium3 text-f14'>
                {
                  permissions?.map(permit => (
                  <li key={permit}>
                    {permit?.replace(/,/g, ', ')}
                  </li>
                ))}
              </ul>
            </div>
        }
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
          title='Send invite'
          containerStyle='!w-[100px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default InviteMemberPage