'use client'

import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { GENERAL_SETTINGS_DATA } from '@/data/systemSettingsData'
import clientAxiosRequest from '@/hooks/clientAxiosRequest'
import { SettingsInputProps } from '@/types/dataTypes'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'
import React, { ChangeEvent, useState } from 'react'
import * as API from '@/config/endpoints';
import { findPermissionSlug } from '@/utils/findPermissionSlug'

const GeneralSettingsPage = ({ rawData, profileData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);
  let userPermissions = profileData?.user?.role?.permissions;
  let updateSettings = findPermissionSlug(userPermissions, 'update-system-setting')

  const [form, setForm] = useState({
    inactivityTimeout: rawData?.inactivityTimeout,
    requestTimeout: rawData?.requestTimeout,
    authTokenExpirationDuration: rawData?.authTokenExpirationDuration,
    passwordResetTokenExpirationDuration: rawData?.passwordResetTokenExpirationDuration,
    twoFaExpirationDuration: rawData?.twoFaExpirationDuration,
    invitationTokenExpirationDuration: rawData?.invitationTokenExpirationDuration,
    failedLoginAttempts: rawData?.failedLoginAttempts,
  });

  const generalSettings = GENERAL_SETTINGS_DATA({ ...form });

  const incorrect = (
    !form?.inactivityTimeout?.value ||
    !form?.requestTimeout?.value ||
    !form?.authTokenExpirationDuration?.value ||
    !form?.passwordResetTokenExpirationDuration?.value ||
    !form?.twoFaExpirationDuration?.value ||
    !form?.invitationTokenExpirationDuration?.value ||
    !form?.failedLoginAttempts?.value
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>, data:SettingsInputProps) => {
    setForm({
      ...form,
      [e.target.name]: {
        ...data,
        value: e.target.value
      }
    })
  };

  const isChanged = (
    form?.inactivityTimeout?.value != rawData?.inactivityTimeout?.value ||
    form?.requestTimeout?.value != rawData?.requestTimeout?.value||
    form?.authTokenExpirationDuration?.value != rawData?.authTokenExpirationDuration?.value ||
    form?.passwordResetTokenExpirationDuration?.value != rawData?.passwordResetTokenExpirationDuration?.value ||
    form?.twoFaExpirationDuration?.value != rawData?.twoFaExpirationDuration?.value ||
    form?.invitationTokenExpirationDuration?.value != rawData?.invitationTokenExpirationDuration?.value ||
    form?.failedLoginAttempts?.value != rawData?.failedLoginAttempts?.value
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const objectData = {};
    for (const key in form) {
      if (form.hasOwnProperty(key)) {
        // @ts-ignore
        objectData[key] = `${form[key].value}`;
      }
    }
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateSettings({
          type: 'general',
        }),
        method: 'PUT',
        data: objectData
      });

    if (result?.message) {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            General Settings
          </h3>
        </div>

        {
          updateSettings &&
          <Button 
            title='Save changes'
            type='submit'
            loading={loading}
            containerStyle='!w-[120px]'
            disabled={incorrect || !isChanged}
            small
          />
        }
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
                  disabled={!updateSettings}
                  value={data?.value}
                  changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e, data)}
                  required
                  maxLength={10}
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