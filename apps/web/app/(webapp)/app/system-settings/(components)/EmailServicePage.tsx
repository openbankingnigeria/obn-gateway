'use client'

import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { SettingsInputProps } from '@/types/dataTypes'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'
import { EMAIL_PROVIDERS, EMAIL_SERVICE_DATA } from '@/data/systemSettingsData'
import React, { ChangeEvent, useState } from 'react'
import * as API from '@/config/endpoints';

const EmailServicePage = ({ rawData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);

  // const [email_provider, setEmailProvider] = useState('sendgrid');
  const [form, setForm] = useState({
    emailBaseUrl: rawData?.emailBaseUrl?.value,
    emailFrom: rawData?.emailFrom?.value,
    emailHost: rawData?.emailHost?.value,
    emailPassword: rawData?.emailPassword?.value,
    emailPort: rawData?.emailPort?.value,
    // emailSecure: rawData?.emailSecure?.value,
    emailUser: rawData?.emailUser?.value,
  });

  const emailService = EMAIL_SERVICE_DATA({ ...form });

  const incorrect = (
    // !email_provider ||
    !form?.emailBaseUrl ||
    !form?.emailFrom ||
    !form?.emailHost ||
    !form?.emailPassword ||
    !form?.emailPort ||
    // !form?.emailSecure ||
    !form?.emailUser
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e);
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    // email_provider != 'sendgrid' ||
    form?.emailBaseUrl != rawData?.emailBaseUrl ||
    form?.emailFrom != rawData?.emailFrom||
    form?.emailHost != rawData?.emailHost ||
    form?.emailPassword != rawData?.emailPassword ||
    form?.emailPort != rawData?.emailPort ||
    // form?.emailSecure != rawData?.emailSecure ||
    form?.emailUser != rawData?.emailUser
  );

  // const email_provider_list = EMAIL_PROVIDERS?.map((provider) => {
  //   return ({
  //     label: provider?.label,
  //     value: provider?.value
  //   })
  // })

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateSettings({
          type: 'email_settings',
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
            Email Service
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
          emailService?.map((data) => (
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
                  // data?.type == 'select' ?
                  //   <>
                  //     <input 
                  //       name='email_provider'
                  //       value={email_provider}
                  //       readOnly
                  //       className='hidden opacity-0'
                  //     />

                  //     <SelectElement 
                  //       name={data?.name}
                  //       options={email_provider_list}
                  //       required
                  //       placeholder='Select provider'
                  //       optionStyle='top-[45px]'
                  //       clickerStyle='!w-full'
                  //       value={data?.value}
                  //       changeValue={setEmailProvider}
                  //     />
                  //   </>
                  //   :
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

export default EmailServicePage