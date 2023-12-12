'use client'

import { ActionsSelector, AppCenterModal, AppRightModal, StatusBox, TwoFactorAuthModal, ViewData } from '@/app/(webapp)/(components)'
import { MEMBERS_ACTIONS_DATA, MEMBERS_ROLES } from '@/data/membersData'
import { updateSearchParams } from '@/utils/searchParams'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import * as API from '@/config/endpoints';
import { ActivateDeactivateMember } from '.'
import { SelectElement } from '@/components/forms'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'

const MemberDetails = ({
  member,
  roles
}: { 
  member: any;
  roles: any;
}) => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const [role, setRole] = useState(member?.roleId);
  const actions = MEMBERS_ACTIONS_DATA;
  const memberName = `${member?.profile?.firstName} ${member?.profile?.lastName}`;
  const memberStatus: 'pending' | 'active' | 'inactive' | 'invited' = member?.status == 'pending' ? 
    'invited' : member?.status;

  const getAction = (status: string) => {
    return actions.filter(action => 
        action?.type == status?.toLowerCase()
      );
  };

  const roleList = roles?.map((role: any) => {
    return ({
      label: role?.name,
      value: role?.id
    })
  });

  useEffect(() => {
    const slug = updateSearchParams('slug', memberName);
    router.push(slug);
  }, [router]);

  const closeModal = () => {
    setOpenModal('');
  }

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal('');
  }

  const handleActivateDeactivateMember = async () => {
    setLoading(true);
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.updateTeam({ id: member?.id }),
      method: 'PATCH',
      data: {
        email: member?.email,
        firstName: member?.profile?.firstName,
        lastName: member?.profile?.lastName,
        roleId: member?.roleId,
        status: openModal == 'deactivate' ? 'inactive' : 'active'
      }
    });

    if (result?.message) {
      setOpenModal('');
      // setOpen2FA(true);
    }
  }

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'deactivate' ?
        '[memberName] has been deactivated and access revoked.' :
        openModal == 'activate' ?
          '[memberName] has been activated and access restored.' :
          null
    )
  };

  const changeRole = (value: string) => {
    setRole(value);
    toast.success(`You have successfully change ${memberName} role`);
  }

  return (
    <>
      {
        (openModal == 'activate' || openModal == 'deactivate') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateMember 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={handleActivateDeactivateMember}
            />
          </AppCenterModal>
      }

      {
        open2FA &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={close2FAModal}
          >
            <TwoFactorAuthModal
              close={close2FAModal}
              loading={loading}
              next={handle2FA}
            />
          </AppCenterModal>
      }

      <section className='flex flex-col gap-[20px] w-full'>
        <header className='w-full flex items-start justify-between gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h2 className='w-full text-f18 text-o-text-dark font-[500]'>
              {memberName}
            </h2>

            <StatusBox status={memberStatus} />
          </div>

          {
            (memberStatus == 'active' || memberStatus == 'inactive') &&
            <ActionsSelector
              label='Actions'
              optionStyle='!min-w-[153px] !top-[38px]'
              small
              options={
                getAction(memberStatus)?.map((action) => (
                  <button
                    key={action.id}
                    className='cursor-pointer whitespace-nowrap hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                    onClick={() => setOpenModal(action.name)}
                  >
                    {action.icon}

                    <span className='whitespace-nowrap'>
                      {action.label}
                    </span>
                  </button>
                ))
              }
            />
          }
        </header>

        <div className='w-full overflow-visible bg-white border border-o-border rounded-[10px] h-fit'>
          <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
            <div className='text-f16 font-[600] text-o-text-dark'>
              Details
            </div>
          </h3>

          <div className='w-full p-[20px] rounded-bl-[10px] rounded-br-[10px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='Name'
              value={memberName}
            />

            <ViewData 
              label='Email Address'
              value={member?.email}
            />

            <ViewData 
              label='Role'
              value={
                <SelectElement 
                  name='role'
                  // @ts-ignore
                  options={roleList}
                  placeholder='Select role'
                  value={role}
                  changeValue={(value: string) => changeRole(value)}
                  containerStyle='!w-fit cursor-pointer'
                  small
                  optionStyle='!top-[38px]'
                />
              }
            />

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusBox status={memberStatus} />
                </div>
              }
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default MemberDetails