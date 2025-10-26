'use client'

import { ActionsSelector, AppCenterModal, StatusBox, ViewData } from '@/app/(webapp)/(components)';
import { CONSENT_ACTIONS_DATA } from '@/data/consentData';
import { updateSearchParams } from '@/utils/searchParams'
import { timestampFormatter } from '@/utils/timestampFormatter';
import { formatDateLabel } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { RevokeConsent } from '.';

const ConsentsDetails = ( ) => {
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState('');
  const actions = CONSENT_ACTIONS_DATA;
  const router = useRouter();
  const consentStatus = 'approved';

  const getAction = (status: string) => {
    return actions.filter(action => {
      return (
        action?.type == status?.toLowerCase()
      );
    });
  }

  const handleResend = () => {
    toast.success('The consent has been resent successfully.');
  }

  useEffect(() => {
    const slug = updateSearchParams('slug', '#128902983GH');
    router.push(slug);
  }, [router]);

  const closeModal = () => {
    setOpenModal('');
  }

  const handleRevoke = () => {
    toast.success('Access to [customer-name] has been revoked');
    closeModal();
  }

  return (
    <>
      {
        (openModal == 'revoke') &&
          <AppCenterModal
            title={'Confirm Action'}
            effect={closeModal}
          >
            <RevokeConsent
              close={closeModal}
              type={openModal}
              loading={loading}
              next={handleRevoke}
            />
          </AppCenterModal>
      }

      <section className='flex flex-col gap-[20px] w-full'>
        <header className='w-full flex items-start justify-between gap-5'>
          <div className='w-full flex flex-col gap-[4px]'>
            <h2 className='w-full text-f18 text-o-text-dark font-[500]'>
              #128902983GH
            </h2>

            <StatusBox status={consentStatus} />
          </div>

          {
            // consentStatus != 'revoked' &&
            // consentStatus != 'declined' &&
            <ActionsSelector
              label='Actions'
              optionStyle='!min-w-[153px] !top-[38px]'
              small
              options={
                getAction(consentStatus)?.map((action) => (
                  <button
                    key={action.id}
                    className='cursor-pointer whitespace-nowrap hover:bg-o-bg-disabled w-full flex gap-[12px] items-center py-[10px] px-[16px] text-o-text-dark text-f14'
                    onClick={() => {
                      action?.name == 'resend' ?
                        handleResend() :
                        setOpenModal(action.name)
                    }}
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
              Details
            </div>
          </h3>

          <div className='w-full p-[20px] grid grid-cols-2 ms:grid-cols-3 lgg:grid-cols-4 gap-[16px] bg-white'>
            <ViewData 
              label='Consent ID'
              value='#128902983GH'
            />

            <ViewData 
              label='Consumer Name'
              value='Dare Bashir'
            />

            <ViewData 
              label='Customer Name'
              value='Lendsqr'
            />

            <ViewData 
              label='Customer Email Address'
              value='john.ajayi@lendsqr.com'
            />

            <ViewData 
              label='Status'
              value={
                <div className='w-fit flex items-center gap-[4px]'>
                  <StatusBox status={consentStatus} />
                </div>
              }
            />

            <ViewData 
              label='Date Sent'
              value={`${timestampFormatter('2023-09-25T08:15:00')}`}
            />

            <ViewData 
              label='Velocity'
              value='20s'
            />

            <ViewData 
              label='Amount'
              value='10'
            />

            <ViewData 
              label='Valid From'
              value={`${formatDateLabel('2023-09-25')}`}
            />
            <ViewData 
              label='Valid Until'
              value={`${formatDateLabel('2023-09-25')}`}
            />
          </div>
        </div>
      </section>
    </>
  )
}

export default ConsentsDetails