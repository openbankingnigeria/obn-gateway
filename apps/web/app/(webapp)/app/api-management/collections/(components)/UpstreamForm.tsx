'use client'

import { InputElement, ToggleSwitch } from '@/components/forms'
import { Button } from '@/components/globalComponents';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { APIConfigurationProps } from '@/types/webappTypes/appTypes';
import React, { useState } from 'react'
import * as API from '@/config/endpoints';
import { useRouter } from 'next/navigation';
import { AppCenterModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';

const UpStreamForm = ({
  rawData,
  profileData
}: APIConfigurationProps) => {
  const [enable, setEnable] = useState(rawData?.enabled || false);
  const [host, setHost] = useState(rawData?.upstream?.host || '');
  const [headerValue, setHeaderValue] = useState('');
  const [headerName, setHeaderName] = useState('');
  const [endpointUrl, setEndpointUrl] = useState(rawData?.upstream?.url || '');

  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const environment = 'development';
  const router = useRouter();

  const incorrect = (
    !host ||
    // !headerName ||
    // !headerValue ||
    !endpointUrl
  );

  const close2FAModal = () => {
    setOpen2FA(false);
  }

  const handleSubmit = async (e: any, code: string,) => {
    e && e.preventDefault();
    if (profileData?.user?.twofaEnabled && !code) {
      setOpen2FA(true);
    } else {
      setLoading(true);
      const result: any = await clientAxiosRequest({
          headers: code ? { 'X-TwoFA-Code' : code, } : {},
          apiEndpoint: API.updateAPI({ 
            environment, 
            id: rawData?.id
          }),
          method: 'PATCH',
          data: {
            "name": rawData?.name,
            "enabled": enable,
            "upstream": {
              ...rawData?.upstream,
              host,
              url: endpointUrl
            },
            "downstream": rawData?.downstream
          }
        });

      if (result?.message) {
        close2FAModal();
        setLoading(false);
        // router.refresh();
      }
    }
  }

  const handle2FA = (value: string) => {
    handleSubmit('', value);
  };

  return (
    <>
      {
        open2FA &&
          <AppCenterModal
            title={'Two-Factor Authentication'}
            effect={close2FAModal}
          >
            <TwoFactorAuthModal
              close={close2FAModal}
              loading={loading}
              next={(value: string) => handle2FA(value)}
            />
          </AppCenterModal>
      }

      <form onSubmit={(e)=>handleSubmit(e, '')} className='w-full'>
        <div 
          className='flex items-start w-full justify-between gap-[40px] pb-[20px] border-b border-o-border'
        >
          <div className='w-[40%] text-f14 font-[500] text-o-text-dark'>
            Upstream Service
          </div>

          <div className='flex bg-white rounded-[12px] border border-o-border gap-[16px] flex-col p-[24px] w-[60%]'>
            <div className='w-full flex items-center justify-between'>
              <div className='w-fit text-f14 font-[500] text-[#2B2E36]'>
                Enable
              </div>

              <ToggleSwitch 
                toggle={enable}
                setToggle={setEnable}
              />
            </div>

            <InputElement 
              name='endpointUrl'
              type='text'
              placeholder='Enter endpoint url'
              label='Endpoint URL'
              value={endpointUrl}
              changeValue={setEndpointUrl}
              required
            />
            <InputElement 
              name='host'
              type='text'
              placeholder='Enter a host'
              label='Host'
              changeValue={setHost}
              value={host}
              required
            />

            <div className='w-full flex items-end gap-[12px]'>
              <InputElement 
                name='headerName'
                type='text'
                placeholder='Enter a header name'
                label='Header'
                value={headerName}
                changeValue={setHeaderName}
                // required
              />

              <InputElement 
                name='endpointUrl'
                type='text'
                placeholder='Enter a header value'
                value={headerValue}
                changeValue={setHeaderValue}
                // required
              />
            </div>

            <div className='w-full flex justify-end'>
              <Button 
                title='Save changes'
                type='submit'
                loading={loading}
                containerStyle='!w-[120px]'
                disabled={incorrect}
                small
              />
            </div>
          </div>
        </div>
      </form>
    </>
  )
}

export default UpStreamForm