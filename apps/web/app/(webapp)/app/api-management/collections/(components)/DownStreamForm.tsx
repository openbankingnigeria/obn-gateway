'use client'

import { InputElement } from '@/components/forms'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes';
import React, { ChangeEvent, useEffect, useState } from 'react'

const DownStreamForm = ({
  rawData,
  profileData
}: APIConfigurationProps) => {

  const [api_name, setApiName] = useState('');
  const [request_method, setRequestMethod] = useState('');
  const [tier, setTier] = useState('');
  const [path, setPath] = useState('');

  // console.log(rawData);

  useEffect(() => {
    setApiName(rawData?.name || '');
    setRequestMethod(rawData?.downstream?.method?.toString());
    setTier('');
    setPath(rawData?.downstream?.path?.toString());
  }, []);

  return (
    <div className='w-full'>
      {
        (profileData == 'api-consumer') ?
          <div className='flex flex-col gap-[20px]'>
            <div className='flex items-start w-full justify-between gap-[40px] pb-[20px] border-b border-o-border'>
              <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
                Request
              </div>

              <div className='flex bg-white overflow-x-auto rounded-[12px] border border-o-border gap-[16px] flex-col p-[24px] w-[60%]'>
                <pre dangerouslySetInnerHTML={{
                  __html: JSON.stringify(rawData?.downstream?.request)?.replace(/\"/g, '"')?.replace(/\\n/g, '\n')
                }} />
              </div>
            </div>

            <div className='flex items-start w-full justify-between gap-[40px] pb-[20px] border-b border-o-border'>
              <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
                Response
              </div>

              <div className='flex bg-white overflow-x-auto rounded-[12px] border border-o-border gap-[16px] flex-col p-[24px] w-[60%]'>
                <pre dangerouslySetInnerHTML={{
                  __html: JSON.stringify(rawData?.downstream?.response)?.replace(/\"/g, '"')?.replace(/\\n/g, '\n')
                }} />
              </div>
            </div>
          </div>
          :
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
                label='Method'
                disabled
                value={request_method}
                required
              />
              {/* <InputElement 
                name='tier'
                type='text'
                placeholder=''
                label='Tier'
                disabled
                value={tier}
                required
              /> */}
              <InputElement 
                name='path'
                type='text'
                placeholder=''
                label='Path'
                disabled
                value={path}
                required
              />
            </div>
          </div>
      }
    </div>
  )
}

export default DownStreamForm