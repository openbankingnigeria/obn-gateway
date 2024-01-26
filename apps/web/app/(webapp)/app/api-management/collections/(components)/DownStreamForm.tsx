'use client'

import { InputElement } from '@/components/forms'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes';
import React, { ChangeEvent, useEffect, useState } from 'react'

const DownStreamForm = ({
  rawData
}: APIConfigurationProps) => {

  const [api_name, setApiName] = useState('');
  const [request_method, setRequestMethod] = useState('');
  const [tier, setTier] = useState('');
  const [paths, setPaths] = useState('');

  console.log(rawData);

  useEffect(() => {
    setApiName(rawData?.name || '');
    setRequestMethod(rawData?.downstream?.methods?.toString());
    setTier('');
    setPaths(rawData?.downstream?.paths?.toString());
  }, []);

  return (
    <div className='w-full'>
      <div 
        className='flex items-start w-full justify-between gap-[40px] pb-[20px] border-b border-o-border'
      >
        <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
          Downstream Service
        </div>

        <div className='flex bg-white rounded-[12px] border border-o-border gap-[16px] flex-col p-[24px] w-[60%]'>
          <InputElement 
            name='api_name'
            type='text'
            placeholder=''
            label='API Name'
            disabled
            value={api_name}
            required
          />
          <InputElement 
            name='request_method'
            type='text'
            placeholder=''
            label='Request Method'
            disabled
            value={request_method}
            required
          />
          <InputElement 
            name='tier'
            type='text'
            placeholder=''
            label='Tier'
            disabled
            value={tier}
            required
          />
          <InputElement 
            name='paths'
            type='text'
            placeholder=''
            label='Paths'
            disabled
            value={paths}
            required
          />
        </div>
      </div>
    </div>
  )
}

export default DownStreamForm