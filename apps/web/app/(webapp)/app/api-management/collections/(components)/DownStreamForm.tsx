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

  const request = rawData?.downstream?.request;
  const response = rawData?.downstream?.response;

  const applyStyle = (key: string, value: any, depth = 0): string => {
    const indentation = ' '.repeat(depth * 2);

    if (typeof value === 'object' && value !== null) {
      const styledObject = Object.keys(value).map(innerKey => {
        const innerValue = value[innerKey];
        return applyStyle(innerKey, innerValue, depth + 1);
      });
      if (!styledObject.length) return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: {}`;
      return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: {<br>${styledObject.join(',<br>')}<br>${indentation}}`;
    } else {
      return `${indentation}<span style='color: #FB8F8F;'>"${key}"</span>: <span style='color: #6CE9A6;'>${typeof value === "string" ? JSON.stringify(value)?.replace(/\"/g, '"')?.replace(/\\n/g, '\n') : value}</span>`;
    }
  };

  const transform = (obj: any) => {
    const style = Object.keys(obj).map(key => {
      const value = obj[key];
      return applyStyle(key, value, 1);
    });
    return `{<br>${style.join(',<br>')}${style.length > 0 ? '<br>' : ''}}`;
  };

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
                  __html: transform({ request })
                }} />
              </div>
            </div>

            <div className='flex items-start w-full justify-between gap-[40px] pb-[20px] border-b border-o-border'>
              <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
                Response
              </div>

              <div className='flex bg-white overflow-x-auto rounded-[12px] border border-o-border gap-[16px] flex-col p-[24px] w-[60%]'>
                <pre dangerouslySetInnerHTML={{
                  __html: transform({ response })
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