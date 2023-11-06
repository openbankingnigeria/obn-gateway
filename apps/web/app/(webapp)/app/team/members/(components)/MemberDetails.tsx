'use client'

import { ActionsSelector, AppCenterModal, AppRightModal, StatusBox, TwoFactorAuthModal, ViewData } from '@/app/(webapp)/(components)'
import { MEMBERS_ACTIONS_DATA, MEMBERS_ROLES } from '@/data/membersData'
import { updateSearchParams } from '@/utils/searchParams'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ActivateDeactivateMember } from '.'
import { ConsumerDetailsProps } from '@/types/webappTypes/appTypes'
import { SelectElement } from '@/components/forms'

const MemberDetails = () => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open2FA, setOpen2FA] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const [role, setRole] = useState('admin_1');
  const actions = MEMBERS_ACTIONS_DATA;
  const memberStatus: 'pending' | 'active' | 'inactive' = 'active';

  const getAction = (status: string) => {
    return actions.filter(action => 
        action?.type == status?.toLowerCase()
      );
  };

  const roleList = MEMBERS_ROLES?.map(role => {
    if (role?.value) {
      return ({
        label: role?.name,
        value: role?.value
      })
    }
  });

  useEffect(() => {
    const slug = updateSearchParams('slug', 'John Ajayi');
    router.push(slug);
  }, [router]);

  const closeModal = () => {
    setOpenModal('');
  }

  const close2FAModal = () => {
    setOpen2FA(false);
    setOpenModal('');
  }

  const handleActivateDeactivateMember = () => {
    // setLoading(true);
    setOpen2FA(true);
  }

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'deactivate' ?
        '[member_name] has been deactivated and access revoked.' :
        openModal == 'activate' ?
          '[member_name] has been activated and access restored.' :
          null
    )
  };

  const changeRole = (value: string) => {
    setRole(value);
    toast.success('You have successfully change John Ajayi role');
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
              John Ajayi
            </h2>

            <StatusBox status={memberStatus} />
          </div>

          {
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
              value='John Ajayi'
            />

            <ViewData 
              label='Email Address'
              value='john.ajayi@lendsqr.com'
            />

            <ViewData 
              label='Role'
              value={
                <SelectElement 
                  name='role'
                  // @ts-ignore
                  options={roleList}
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