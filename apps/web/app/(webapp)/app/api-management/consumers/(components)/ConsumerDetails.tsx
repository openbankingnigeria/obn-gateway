'use client'

import { ActionsSelector, AppCenterModal, AppRightModal, StatusBox, TwoFactorAuthModal, ViewData } from '@/app/(webapp)/(components)'
import { CONSUMER_ACTIONS_DATA } from '@/data/consumerData'
import { updateSearchParams } from '@/utils/searchParams'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ActivateDeactivateConsumer, ApproveConsumer, DeclineConsumer } from '.'
import { ConsumerDetailsProps } from '@/types/webappTypes/appTypes'

const ConsumerDetails = ({
  rawData,
  status,
  dataList,
  searchQuery
}: ConsumerDetailsProps) => {

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [open2FA, setOpen2FA] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const actions = CONSUMER_ACTIONS_DATA;
  const consumerStatus: 'pending' | 'active' | 'inactive' | 'rejected' = 'pending';

  const getAction = (status: string) => {
    return actions.filter(action => 
        action?.type == status?.toLowerCase()
      );
  };

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

  const handleActivateDeactivateConsumer = () => {
    // setLoading(true);
    setOpen2FA(true);
  }

  const handleApproveConsumer = () => {
    // setLoading(true);
    setOpen2FA(true);
  }

  const handleDeclineConsumer = () => {
    // setLoading(true);
    // reason
    setOpen2FA(true);
  }

  const handle2FA = () => {
    close2FAModal();
    toast.success(
      openModal == 'deactivate' ?
        'You have successfully deactivated [api_consumer_name]’s access.' :
        openModal == 'activate' ?
          'You have successfully activated [api_consumer_name]’s access.' :
          openModal == 'approve' ?
            'You have successfully approved [api_consumer_name] access request.' :
            openModal == 'decline' ?
            'You have successfully declined [api_consumer_name] access request.' :
            null
    )
  };

  return (
    <>
      {
        (openModal == 'activate' || openModal == 'deactivate') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <ActivateDeactivateConsumer 
              close={closeModal}
              type={openModal}
              loading={loading}
              next={handleActivateDeactivateConsumer}
            />
          </AppCenterModal>
      }

      {
        (openModal == 'approve' || openModal == 'decline') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            {
              openModal == 'approve' ?
                <ApproveConsumer 
                  close={closeModal}
                  loading={loading}
                  next={handleApproveConsumer}
                />
                :
                <DeclineConsumer 
                  close={closeModal}
                  reason={reason}
                  setReason={setReason}
                  loading={loading}
                  next={handleDeclineConsumer}
                />
            }
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

            <StatusBox status={rawData?.type} />
          </div>

          {
            // consumerStatus != 'rejected' &&
            <ActionsSelector
              label='Actions'
              optionStyle='!min-w-[153px] !top-[38px]'
              small
              options={
                getAction(consumerStatus)?.map((action) => (
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

        <div className='w-full overflow-hidden bg-white border border-o-border rounded-[10px] h-fit'>
          <h3 className='px-[20px] py-[16px] w-full border-b border-o-border bg-o-bg2'>
            <div className='text-f16 font-[600] text-o-text-dark'>
              Basic information
            </div>
          </h3>

          <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='Name'
              value=''
            />

            <ViewData 
              label='Email Address'
              value=''
            />

            <ViewData 
              label='Phone Number'
              value=''
            />

            <ViewData 
              label='User Type'
              value={
                <StatusBox 
                  status={rawData?.type} 
                />
              }
            />

            {
              (rawData?.type == 'business' || rawData?.type == 'licensed-entity') &&
                <ViewData 
                  label='Business Name'
                  value=''
                />
            }

            {
              (rawData?.type == 'business' || rawData?.type == 'licensed-entity') &&
                <ViewData 
                  label='Business Type'
                  value=''
                />
            }

            {
              rawData?.type == 'business' &&
                <ViewData 
                  label='CAC Number'
                  value=''
                />
            }

            {
              rawData?.type == 'individual' &&
                <ViewData 
                  label='BVN'
                  value=''
                />
            }

            {
              (rawData?.type == 'individual' || rawData?.type == 'business') &&
                <ViewData 
                  label='Account Number'
                  value=''
                />
            }

            {
              rawData?.type == 'licensed-entity' &&
                <ViewData 
                  label='Role'
                  value=''
                />
            }

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusBox status={consumerStatus} />
                </div>
              }
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default ConsumerDetails