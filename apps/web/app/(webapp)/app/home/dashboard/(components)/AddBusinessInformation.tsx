'use client'

import { postAddBusinessInfo } from '@/actions/profileActions'
// import { DragAndUploadFile } from '@/app/(webapp)/(components)'
import { DragAndUploadElement, InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { AddBusinessInformationProps } from '@/types/webappTypes/appTypes'
import React, { useState } from 'react'
import { ConfirmCancel } from '.'
import { useServerAction } from '@/hooks'
import { useRouter } from 'next/navigation'

const AddBusinessInformation = ({
  close,
  openModal,
  setOpenModal,
  next
}: AddBusinessInformationProps) => {
  const [cac, setCac] = useState('');
  const router = useRouter();
  const [regulator_license, setRegulatorLicense] = useState('');
  const [certificate_of_incorporation, setCertificationOfIncorporation] = useState('');
  const [tin, setTin] = useState('');
  const [company_status_report, setCompanyStatusReport] = useState('');

  const incorrect = (
    cac?.length != 15 ||
    !regulator_license ||
    !certificate_of_incorporation ||
    tin?.length != 15 ||
    !company_status_report
  );

  const handleCac = (value: string) => {
    if (value?.length <= 15) {
      setCac(value?.toString()?.replace(/[^0-9a-zA-Z]/g, ''));
    }
  }

  const handleTin = (value: string) => {
    if (value?.length <= 15){
      setTin(value?.toString()?.replace(/[^0-9-]/g, ''));
    }
  }

  const initialState = {}
  const [state, formAction] = useServerAction(postAddBusinessInfo, initialState);
  if(state?.response?.status == 200) {
    next();
    router.refresh();
  }

  return (
    <>
      {
        (openModal == 'cancel') && 
          <ConfirmCancel 
            close={() => setOpenModal('add')}
            next={() => next()}
          />
      }

      <form
        action={incorrect ? '' : formAction}
        className='gap-[32px] flex flex-col h-full w-full relative'
      >
        <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
          <div className='w-full flex flex-col gap-[6px]'>
            <InputElement 
              name='cac'
              type='cac'
              placeholder='RC Number'
              label='CAC Registration Number'
              value={cac}
              changeValue={(value: string) => handleCac(value)}
              required
            />
            {/* <div className='w-full'>
              <a className='text-f12 text-o-light-blue cursor-pointer hover:text-o-dark-blue'>
                What is a CAC registration number?
              </a>
            </div> */}
          </div>

          <div className='w-full flex flex-col gap-[6px]'>
            <InputElement 
              name='tin'
              type='tin'
              placeholder='Tax identification number'
              label='Tax Identification Number (TIN)'
              value={tin}
              changeValue={(value: string) => handleTin(value)}
              required
            />
            {/* <div className='w-full'>
              <a className='text-f12 text-o-light-blue cursor-pointer hover:text-o-dark-blue'>
                What is a Tax Identification Number (TIN)?
              </a>
            </div> */}
          </div>

          <div className='w-full flex flex-col gap-[6px]'>
            <DragAndUploadElement 
              required={true}
              label={'Certificate of Incorporation'}
              name={'certificate_of_incorporation'}
              changeValue={setCertificationOfIncorporation}
              value={certificate_of_incorporation}
            />
            {/* <div className='w-full'>
              <a className='text-f12 text-o-light-blue cursor-pointer hover:text-o-dark-blue'>
                What is a Certificate of Incorporation?
              </a>
            </div> */}
          </div>

          <div className='w-full flex flex-col gap-[6px]'>
            <DragAndUploadElement 
              required={true}
              label={'Company Status Report'}
              name={'company_status_report'}
              changeValue={setCompanyStatusReport}
              value={company_status_report}
            />
            {/* <div className='w-full'>
              <a className='text-f12 text-o-light-blue cursor-pointer hover:text-o-dark-blue'>
                Document on Company&#39;s shareholding, details of shareholders, Board, and Secretary.
              </a>
            </div> */}
          </div>

          <div className='w-full flex flex-col gap-[6px]'>
            <DragAndUploadElement 
              required={true}
              label={'Regulatory License'}
              name={'regulator_license'}
              changeValue={setRegulatorLicense}
              value={regulator_license}
            />
            {/* <div className='w-full'>
              <a className='text-f12 text-o-light-blue cursor-pointer hover:text-o-dark-blue'>
                What is a Regulatory License?
              </a>
            </div> */}
          </div>
        </div>

        <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
          <Button 
            title='Cancel'
            effect={() => close()}
            small
            outlined
          />

          <Button 
            type='submit'
            title='Submit'
            containerStyle='!w-[80px]'
            disabled={incorrect}
            small
          />
        </div>
      </form>
    </>
  )
}

export default AddBusinessInformation