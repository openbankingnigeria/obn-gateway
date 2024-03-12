'use client'

import { ONBOARDING_SETTINGS_DATA } from "@/data/systemSettingsData";
import clientAxiosRequest from "@/hooks/clientAxiosRequest";
import { APIConfigurationProps } from "@/types/webappTypes/appTypes"
import { findPermissionSlug } from "@/utils/findPermissionSlug";
import { ChangeEvent, useState } from "react";
import * as API from '@/config/endpoints';
import { converToObject } from "@/utils/converToObject";
import { Button } from "@/components/globalComponents";
import { InputElement } from "@/components/forms";

const OnboardingSettingsPage = ({ rawData, profileData }: APIConfigurationProps) => {
  const [loading, setLoading] = useState(false);
  let userPermissions = profileData?.user?.role?.permissions;
  let updateKYBSettings = findPermissionSlug(userPermissions, 'update-kyb-requirement-setting')
  let updateKYB = findPermissionSlug(userPermissions, 'update-kyb-requirements')

  const [form, setForm] = useState({
    businessType: '',
    businessLabel: '',
    businessKey: '',
    licensedEntityType: '',
    licensedEntityLabel: '',
    licensedEntityKey: '',
    individualType: '',
    individualLabel: '',
    individualKey: '',
  });

  // console.log(rawData)
  const onboardingSettings = ONBOARDING_SETTINGS_DATA({ ...form });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // console.log(e);
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    form?.businessType != ''  ||
    form?.businessLabel != '' ||
    form?.businessKey != ''  ||
    form?.licensedEntityType != ''  ||
    form?.licensedEntityLabel != ''  ||
    form?.licensedEntityKey != '' ||
    form?.individualType != ''  ||
    form?.individualLabel != ''  ||
    form?.individualKey != '' 
  );

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const result: any = await clientAxiosRequest({
        headers: {},
        apiEndpoint: API.updateSettings({
          type: 'onboarding_custom_fields',
        }),
        method: 'PUT',
        data: {
          "business": form?.businessKey ?
            converToObject({
              key: form?.businessKey,
              label: form?.businessLabel || '',
              type: form?.businessType || ''
            }): {},
          "licensed-entity": form?.licensedEntityKey ?
            converToObject({
              key: form?.licensedEntityKey,
              label: form?.licensedEntityLabel || '',
              type: form?.licensedEntityType || ''
            }) : {},
          "individual": form?.individualKey ? 
            converToObject({
              key: form?.individualKey,
              label: form?.individualLabel || '',
              type: form?.individualType || ''
            }) : {}
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

        {
          (updateKYBSettings || updateKYB) &&
          <Button 
          title='Save changes'
          type='submit'
          loading={loading}
          containerStyle='!w-[120px]'
          disabled={!isChanged}
          small
        />
        } 
      </div>
    
      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          onboardingSettings?.map((data) => (
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

              <div className='w-[60%] flex flex-col gap-3'>
                {
                  data?.values?.map((value: any) => (
                    <>
                      <InputElement 
                        name={value?.name}
                        type={'text'}
                        placeholder={value?.label}
                        disabled={!(updateKYBSettings || updateKYB)}
                        value={value?.value}
                        changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
                        // required
                      />
                    </>
                  ))
                }
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default OnboardingSettingsPage