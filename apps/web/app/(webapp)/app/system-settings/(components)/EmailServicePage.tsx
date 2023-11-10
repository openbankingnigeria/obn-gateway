'use client'

import { updateEmailService } from '@/actions/systemSettingActions'
import { InputElement, SelectElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { EMAIL_PROVIDERS, EMAIL_SERVICE_DATA } from '@/data/systemSettingsData'
import React, { ChangeEvent, useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const EmailServicePage = () => {
  const [email_provider, setEmailProvider] = useState('sendgrid');
  const [form, setForm] = useState({
    email_key: '123456',
    email_sender_id: 'noreply@example.com',
    email_base_url: 'https://email.example.com',
  });

  const emailService = EMAIL_SERVICE_DATA({
    email_provider,
    email_key: form?.email_key,
    email_sender_id: form?.email_sender_id,
    email_base_url: form?.email_base_url,
  });

  const incorrect = (
    !email_provider ||
    !form?.email_key ||
    !form?.email_sender_id ||
    !form?.email_base_url 
  );

  const initialState = {
    message: null
  };

  const [state, formAction] = useFormState(updateEmailService, initialState);
    state?.message && toast.success(state?.message);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    email_provider != 'sendgrid' ||
    form?.email_key != '123456'||
    form?.email_sender_id != 'noreply@example.com' ||
    form?.email_base_url != 'https://email.example.com'
  );

  const email_provider_list = EMAIL_PROVIDERS?.map((provider) => {
    return ({
      label: provider?.label,
      value: provider?.value
    })
  })

  return (
    <form
      action={incorrect ? '' : formAction}
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
                  data?.type == 'select' ?
                    <>
                      <input 
                        name='email_provider'
                        value={email_provider}
                        readOnly
                        className='hidden opacity-0'
                      />

                      <SelectElement 
                        name={data?.name}
                        options={email_provider_list}
                        required
                        optionStyle='top-[45px]'
                        clickerStyle='!w-full'
                        value={data?.value}
                        changeValue={setEmailProvider}
                      />
                    </>
                    :
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