'use client'

import { updateGeneraSettings } from '@/actions/systemSettingActions'
import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { GENERAL_SETTINGS_DATA } from '@/data/systemSettingsData'
import React, { ChangeEvent, useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const GeneralSettingsPage = () => {
  const [form, setForm] = useState({
    inactivity_timeout: '5',
    request_timeout: '30',
    auth_token_expiration_duration: '30',
    password_reset_token_expiration_duration: '30',
    two_fa_expiration_duration: '30',
    invitation_token_expiration_duration: '30',
    failed_login_attempts: '30',
  });

  const generalSettings = GENERAL_SETTINGS_DATA({
    inactivity_timeout: form?.inactivity_timeout,
    request_timeout: form?.request_timeout,
    auth_token_expiration_duration: form?.auth_token_expiration_duration,
    password_reset_token_expiration_duration: form?.password_reset_token_expiration_duration,
    two_fa_expiration_duration: form?.two_fa_expiration_duration,
    invitation_token_expiration_duration: form?.invitation_token_expiration_duration,
    failed_login_attempts: form?.failed_login_attempts,
  });

  const incorrect = (
    !form?.inactivity_timeout ||
    !form?.request_timeout ||
    !form?.auth_token_expiration_duration ||
    !form?.password_reset_token_expiration_duration ||
    !form?.two_fa_expiration_duration ||
    !form?.invitation_token_expiration_duration ||
    !form?.failed_login_attempts
  );

  const initialState = {
    message: null
  };

  const [state, formAction] = useFormState(updateGeneraSettings, initialState);
    state?.message && toast.success(state?.message);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    form?.inactivity_timeout != '5' ||
    form?.request_timeout != '30'||
    form?.auth_token_expiration_duration != '30' ||
    form?.password_reset_token_expiration_duration != '30' ||
    form?.two_fa_expiration_duration != '30' ||
    form?.invitation_token_expiration_duration != '30' ||
    form?.failed_login_attempts != '30'
  );

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            General Settings
          </h3>
        </div>

        <Button 
          title='Saves changes'
          type='submit'
          containerStyle='!w-[120px]'
          disabled={incorrect || !isChanged}
          small
        />
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          generalSettings?.map((data) => (
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
                <InputElement 
                  name={data?.name}
                  type={data?.type}
                  placeholder=''
                  value={data?.value}
                  changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
                  required
                  rightIcon={
                    <span className='text-f14 whitespace-nowrap text-o-text-muted2'>
                      {data?.rightLabel}
                    </span>
                  }
                />
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default GeneralSettingsPage