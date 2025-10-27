'use client'

import React, { ChangeEvent, FormEvent, useCallback, useEffect, useState } from 'react'
import { InputElement } from '@/components/forms'
import { Button } from '@/components/globalComponents'
import { CLIENT_ID_DATA } from '@/data/systemSettingsData'
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import * as API from '@/config/endpoints';
import { useRouter } from 'next/navigation'
import { APIConfigurationProps } from '@/types/webappTypes/appTypes'
import { getJsCookies } from '@/config/jsCookie'

const ClientIdPage = ({ profileData }: APIConfigurationProps) => {
  const environment = getJsCookies('environment');
  const [client, setClient] = useState<any>(null);
  const [clientId, setClientId] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchClientId = useCallback(async () => {
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.getClientId({
        environment: environment || 'development'
      }),
      method: 'GET',
      data: null,
      noToast: true
    });

    setClient(result?.data);
  }, [environment]);

  useEffect(() => {
    fetchClientId();
  }, [fetchClientId]);

  const incorrect = (
    !clientId
  );

  const allowEdit = (
    client?.clientId != clientId
  );

  useEffect(() => {
    setClientId(client?.clientId)
  }, [client]);

  const clientIdData = CLIENT_ID_DATA({
    clientId: clientId
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const result: any = await clientAxiosRequest({
      headers: {},
      apiEndpoint: API.putClientId({
        environment: environment || 'development'
      }),
      method: 'PUT',
      data: { clientId }
    })

    setLoading(false);
    if (result?.status == 200) {
      router?.refresh();
    }
  }

  return (
    <form
      onSubmit={(e) => handleSubmit(e)}
      className='gap-[20px] flex flex-col w-full pb-[24px]'
    >
      <div className='w-full justify-between flex items-start gap-5'>
        <div className='w-full flex flex-col gap-[4px]'>
          <h3 className='w-full text-f18 font-[500] text-o-text-dark'>
            Client ID
          </h3>
          <div className='text-f14 text-o-text-medium3'>
            Unique client ID
          </div>
        </div>

        <div className='w-fit flex gap-5 items-end'>
          <Button 
            title={'Update'}
            type='submit'
            loading={loading}
            containerStyle='!w-[120px]'
            disabled={(incorrect || loading || !allowEdit)}
            small
          />
        </div>
      </div>

      <div className='w-full gap-[20px] p-[24px] flex flex-col bg-white rounded-[12px] border border-o-border'>
        {
          clientIdData?.map((data) => (
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
                  placeholder={data?.placeholder}
                  value={data?.value}
                  changeEvent={(e: ChangeEvent<HTMLInputElement>) => 
                      setClientId(e.target.value)
                  }
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

export default ClientIdPage