'use client'

import { ToggleSwitch } from '@/components/forms'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import React, { useState } from 'react'
import * as API from '@/config/endpoints';
import { AppCenterModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { useRouter } from 'next/navigation';
import { getJsCookies } from '@/config/jsCookie';

const EnabledToggle = ({ 
  rawData,
  profileData 
}: { 
  rawData: any;  
  profileData: any;
}) => {
  const [enable, setEnable] = useState(rawData?.enabled || false);
  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const environment = getJsCookies('environment');

  // console.log(rawData)

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
            environment: environment || 'development', 
            id: rawData?.id
          }),
          method: 'PATCH',
          data: {
            "name": rawData?.name,
            "upstream": rawData?.upstream,
            "downstream": {
              ...rawData?.downstream,
            },
            "enabled": !enable,
          }
        });

      setLoading(false);
      if (result?.message) {
        setEnable((prev: boolean) => !prev)
        close2FAModal();
        router.refresh();
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

      <div className='w-full flex items-center gap-4 justify-end'>
        <div className='w-fit text-f14 font-[500] text-[#2B2E36]'>
          Enable
        </div>

        <ToggleSwitch 
          toggle={enable}
          setToggle={() => handleSubmit('', '')}
        />
      </div>
    </>
  )
}

export default EnabledToggle