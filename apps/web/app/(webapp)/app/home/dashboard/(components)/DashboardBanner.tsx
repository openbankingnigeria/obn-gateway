'use client'

import { AppRightModal } from '@/app/(webapp)/(components)';
import { Button } from '@/components/globalComponents'
import Image from 'next/image';
import React, { useState } from 'react'
import { AddBusinessInformation } from '.';
import { getStorage, setStorage } from '@/config/webStorage';

const DashboardBanner = ({
  rawData
}: { rawData: any }) => {
  const [openModal, setOpenModal] = useState('');
  const close_modal = Boolean(getStorage('close-banner'));
  const [closebanner, setCloseBanner] = useState(Boolean(close_modal));

  const cancelModal = () => {
    setOpenModal('cancel');
  }

  const closeModal = () => {
    setOpenModal('');
  }

  const handleCloseBanner = () => {
    // setStorage('close-banner', 'yes');
    setCloseBanner(prev => !prev);
  }

  return (
    <div className='w-full'>
      {
        openModal &&
          <AppRightModal
            title={'Add Business Information'}
            effect={cancelModal}
            childrenStyle='relative !px-0'
          >
            <AddBusinessInformation 
              close={cancelModal}
              next={closeModal}
              setOpenModal={setOpenModal}
              openModal={openModal}
            />
          </AppRightModal>
      }

      {
        (!closebanner) ?
          <div className='w-full relative overflow-hidden flex items-center justify-between rounded-[12px] bg-[#F3F6FB] border-[#DCE4F4]'>
            {
              rawData?.isVerified &&
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 20 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className='absolute cursor-pointer top-[14px] right-[14px]'
                onClick={handleCloseBanner}
              >
                <path 
                  d="M15 5L5 15M5 5L15 15" 
                  stroke="#2B2E36" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  fill='transparent' 
                />
              </svg>
            }

            <div className='p-[20px] gap-[20px] w-[55%] flex flex-col'>
              <div className='w-full flex flex-col gap-[8px]'>
                <h2 className='w-full text-f18 font-[600] text-o-text-dark'>
                  {
                    rawData?.isVerified ? 
                      'Verification Successful' :
                      (!rawData?.isVerified && rawData?.kybData?.taxIdentificationNumber) ?
                        'Verification in Progress' :
                        'Complete Your Account Setup'
                  }
                </h2>

                <div className='text-f14 text-o-text-dark'>
                  {
                    rawData?.isVerified ? 
                      `Your account has been verified successfully! 
                      You now have full access to all API features 
                      and services.` :
                      (!rawData?.isVerified && rawData?.kybData?.taxIdentificationNumber) ?
                        `Your account will be verified once your 
                        business information is confirmed.` :
                        `Provide your business information to get 
                        your Aperta account up and running.`
                  }
                </div>
              </div>

              {
                (!rawData?.isVerified && !rawData?.kybData?.taxIdentificationNumber) &&
                <Button 
                  title={'Add business information'}
                  effect={() => setOpenModal('add')}
                  small
                  containerStyle='!w-[200px]'
                />
              }
            </div>

            <div className={`w-[45%] flex items-center ${(!rawData?.isVerified && !rawData?.kybData?.taxIdentificationNumber) ? 'pt-[19px]' : 'h-full'} justify-end pr-[51px]`}>
              <Image 
                src={
                  rawData?.isVerified ? 
                    '/images/verification_successful.png' :
                    (!rawData?.isVerified && rawData?.kybData?.taxIdentificationNumber) ?
                      '/images/verification_pending.png' :
                      '/images/account_setup.png'
                }
                alt='status'
                loading='lazy'
                width={
                  rawData?.isVerified ?
                    218 :
                    (!rawData?.isVerified && rawData?.kybData?.taxIdentificationNumber) ?
                      169 :
                      290
                }
                height={170}
                className='object-cover absolute'
              />
            </div>
          </div>
          : null
      }
    </div>
  )
}

export default DashboardBanner