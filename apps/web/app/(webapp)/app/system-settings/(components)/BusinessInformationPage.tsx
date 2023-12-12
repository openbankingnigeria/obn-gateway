'use client'

import React, { ChangeEvent, useState } from 'react'
import { postAddBusinessInfo } from '@/actions/profileActions'
import { DragAndUploadElement, InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { useServerAction } from '@/hooks'
import { BUSINESS_INFORMATION_DATA } from '@/data/systemSettingsData'

const BusinessInformationPage = () => {
  const [cac, setCac] = useState('');
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

  const businessInformation = BUSINESS_INFORMATION_DATA({
    cac: cac,
    tin: tin,
    regulator_license: regulator_license,
    certificate_of_incorporation: certificate_of_incorporation,
    company_status_report: company_status_report,
  });

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

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Business information
          </h3>
          <div className='text-f14 text-o-text-medium3'>
            Information submitted for verification
          </div>
        </div>

        <Button 
          title='Submit'
          type='submit'
          containerStyle='!w-[120px]'
          disabled={incorrect}
          small
        />
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          businessInformation?.map((data) => (
            <div 
              key={data?.id}
              className='w-full last-of-type:border-0 last-of-type:pb-0 flex items-start justify-between gap-[40px] pb-[20px] border-b border-o-border'
            >
              <div className='w-[40%] flex flex-col gap-[8px]'>
                <label 
                  className='text-f14 font-[500] text-o-text-dark'
                  htmlFor={data?.name}
                >
                  {data?.label}
                </label>

                <div className='text-f14 text-o-text-medium3'>
                  {data?.description}
                </div>
              </div>

              <div className='w-[60%]'>
                {
                  data?.type == 'file' ?
                    <DragAndUploadElement 
                      required={true}
                      name={data?.name}
                      changeValue={
                        data?.name == 'regulator_license' ? 
                          setRegulatorLicense :
                          data?.name == 'certificate_of_incorporation' ? 
                            setCertificationOfIncorporation :
                            data?.name == 'company_status_report' ? 
                              setCompanyStatusReport :
                              null
                      }
                      value={data?.value}
                    />
                    :
                    <InputElement 
                      name={data?.name}
                      type={data?.type}
                      placeholder={data?.placeholder}
                      value={data?.value}
                      changeEvent={(e: ChangeEvent<HTMLInputElement>) => {
                        data?.name == 'cac' ? 
                          handleCac(e.target.value) :
                          handleTin(e.target.value)
                      }}
                      required
                      rightIcon={
                        <span className='text-f14 whitespace-nowrap text-o-text-muted2'>
                          {data?.rightLabel}
                        </span>
                      }
                    />
                }
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default BusinessInformationPage