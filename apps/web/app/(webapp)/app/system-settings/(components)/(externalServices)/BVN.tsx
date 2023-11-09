'use client'

import { updateExternalServices } from '@/actions/systemSettingActions'
import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { EXTERNAL_SERVICES_DATA } from '@/data/systemSettingsData'
import React, { ChangeEvent, useState } from 'react'
// @ts-ignore
import { experimental_useFormState as useFormState } from 'react-dom'
import { toast } from 'react-toastify';

const BVN = () => {
  const [form, setForm] = useState({
    url: 'registry.example.com',
    api_key: 'pspk_test_f8q9u9kg5ocosk1kqlgolgxuzu0wmk6coo6smceg',
  });

  const registry = EXTERNAL_SERVICES_DATA({
    url: form?.url,
    api_key: form?.api_key,
    urlDescription: 'The address where the BVN service can be accessed.',
    apiKeyDescription: 'The API key to authenticate access to the BVN service features and data.'
  });

  const incorrect = (
    !form?.url ||
    !form?.api_key
  );

  const initialState = {
    message: null,
    location: 'bvn'
  };

  const [state, formAction] = useFormState(updateExternalServices, initialState);
    state?.message && toast.success(state?.message);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  };

  const isChanged = (
    form?.url != 'registry.example.com'||
    form?.api_key != 'pspk_test_f8q9u9kg5ocosk1kqlgolgxuzu0wmk6coo6smceg' 
  );

  return (
    <form
      action={incorrect ? '' : formAction}
      className='gap-[20px] flex flex-col w-full pb-[24px] border-b border-o-border'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            BVN
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
          registry?.map((data) => (
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
                  leftIcon={
                    data?.name == 'url' &&
                    <span className='whitespace-nowrap text-f14 text-o-text-muted2'>
                      https://
                    </span>
                  }
                  changeEvent={(e: ChangeEvent<HTMLInputElement>) => handleChange(e)}
                  required
                />
              </div>
            </div>
          ))
        }
      </div>
    </form>
  )
}

export default BVN