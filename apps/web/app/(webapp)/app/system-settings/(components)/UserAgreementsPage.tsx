'use client'

import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'
import React, { ChangeEvent, useState } from 'react';
import * as API from '@/config/endpoints';
import { InputElement } from '@/components/forms';
import { Button } from '@/components/globalComponents';
import { USER_AGREEMENTS_DATA } from '@/data/systemSettingsData';

const UserAgreementsPage = ({ rawData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    privacyPolicy: rawData?.privacyPolicy?.value,
    termsAndConditions: rawData?.termsAndConditions?.value,
  });

  const userAgreements = USER_AGREEMENTS_DATA({ ...form });

  const incorrect = (
    !form?.privacyPolicy ||
    !form?.termsAndConditions
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e);
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    form?.privacyPolicy != rawData?.privacyPolicy ||
    form?.termsAndConditions != rawData?.termsAndConditions?.value
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateSettings({
          type: 'user_agreements',
        }),
        method: 'PUT',
        data: {
          ...form
        }
      });

    if (result?.message) {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Onboarding Settings
          </h3>
        </div>

        <Button 
          title='Save changes'
          type='submit'
          loading={loading}
          containerStyle='!w-[120px]'
          disabled={incorrect || !isChanged}
          small
        />
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          userAgreements?.map((data: any) => (
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
                  <InputElement 
                    name={data?.name}
                    type={data?.type}
                    placeholder=''
                    value={data?.value}
                    changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
                    required
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

export default UserAgreementsPage