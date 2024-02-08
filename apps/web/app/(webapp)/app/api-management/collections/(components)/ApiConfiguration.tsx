'use client'

import { RequestMethodText } from '@/app/(webapp)/(components)'
import { InputElement } from '@/components/forms'
import TextareaElement from '@/components/forms/TextareaElement'
import { Button } from '@/components/globalComponents'
import { ApiConfigurationProps } from '@/types/webappTypes/appTypes'
import React from 'react'
import { HeadersContainer, HostsContainer, SnisContainer } from '.'

const ApiConfiguration = ({
  close,
  loading,
  data,
  next,
  endpoint_url,
  parameters,
  snis,
  hosts,
  headers,
  setEndpointUrl,
  setParameters,
  setSnis,
  setHost,
  setHeaders,
}: ApiConfigurationProps) => {
  const incorrect = !endpoint_url;

  const handleRemove = (type: string, value: string | number) => {
    type == 'hosts' ?
      setHost([...hosts].filter((item) => item.id !== value)) :
      type == 'snis' ?
        setSnis([...snis].filter((item) => item.id !== value)) :
        setHeaders([...headers].filter((item) => item.id !== value));
  };

  const handleInputChange = (value: string, obj: any, key: any, type: string) => {
    if (type == 'hosts') {
      const [oldHosts] = hosts.filter((host) => host == obj);
      // @ts-ignore
      oldHosts[key] = value;
  
      const newHosts = hosts;
      newHosts[hosts.indexOf(obj)] = oldHosts;
      setHost([...newHosts]);
    } else if (type == 'snis') {
      const [oldSnis] = snis.filter((sni) => sni == obj);
      // @ts-ignore
      oldSnis[key] = value;
  
      const newSnis = snis;
      newSnis[snis.indexOf(obj)] = oldSnis;
      setSnis([...newSnis]);
    } else {
      const [oldHeaders] = headers.filter((host) => host == obj);
      // @ts-ignore
      oldHeaders[key] = value;
  
      const newHeaders = headers;
      newHeaders[headers.indexOf(obj)] = oldHeaders;
      setHeaders([...newHeaders]);
    }
  }

  const handleAdd = (type: string) => {
    type == 'hosts' ?
      setHost(prev => [
        ...prev,
        {
          id: prev?.length,
          value: ''
        } 
      ]) :
      type == 'snis' ?
        setSnis(prev => [
          ...prev,
          {
            id: prev?.length,
            value: ''
          } 
        ]) :
        setHeaders(prev => [
          ...prev, 
          {
            id: prev?.length,
            name: '',
            value: ''
          }
        ])
  };

  return (
    <form
      onSubmit={(e) => next('', e)}
      className='gap-[32px] flex flex-col h-full w-full relative'
    >
      <div className='flex flex-col h-[calc(100%-50px)] overflow-auto gap-[16px] w-full px-[20px]'>
        <section className='w-full p-[20px] flex flex-col gap-[12px] rounded-[6px] border border-o-border bg-[#F8FAFB]'>
          {/* API NAME */}
          <div className='flex items-center justify-between gap-5'>
            <div className='text-f14 w-fit text-o-text-muted2'>
              API Name
            </div>

            <div className='w-fit text-o-text-dark text-f14 font-[500]'>
              {data?.name}
            </div>
          </div>

          {/* METHOD */}
          <div className='flex items-center justify-between gap-5'>
            <div className='text-f14 w-fit text-o-text-muted2'>
              Method
            </div>

            <div className='w-fit text-f14 font-[500]'>
              <RequestMethodText 
                method={data?.route?.method?.toString()}
              />
            </div>
          </div>

          {/* TIER */}
          <div className='flex items-center justify-between gap-5'>
            <div className='text-f14 w-fit text-o-text-muted2'>
              Tier
            </div>

            <div className='w-fit text-o-text-dark text-f14 font-[500]'>
              {data?.tier}
            </div>
          </div>
        </section>

        <div className='w-full border-b border-o-border pb-[16px]'>
          <InputElement 
            name='endpoint_url'
            placeholder='Endpoint url'
            label='Endpoint URL'
            value={endpoint_url}
            changeValue={setEndpointUrl}
            required
          />
        </div>

        <div className='w-full border-b border-o-border pb-[16px]'>
          <TextareaElement
            name='parameters'
            rows={3}
            value={parameters}
            changeValue={setParameters}
            placeholder='Parameters'
            label='Parameters (if any)'
          />
        </div>

        <div className='w-full border-b border-o-border flex flex-col gap-[12px] pb-[16px]'>
          <SnisContainer 
            data={snis}
            handleInputChange={handleInputChange}
            handleRemove={handleRemove}
            handleAdd={handleAdd}
          />
        </div>

        <div className='w-full border-b border-o-border flex flex-col gap-[12px] pb-[16px]'>
          <HostsContainer 
            data={hosts}
            handleInputChange={handleInputChange}
            handleRemove={handleRemove}
            handleAdd={handleAdd}
          />
        </div>

        <div className='w-full pb-[16px] flex flex-col gap-[12px]'>
          <HeadersContainer 
            data={headers}
            handleInputChange={handleInputChange}
            handleRemove={handleRemove}
            handleAdd={handleAdd}
          />
        </div>
      </div>

      <div className='px-[20px] w-full h-[50px] mt-auto absolute bottom-0 z-[10] bg-white flex items-end justify-between'>
        <Button 
          title='Cancel'
          effect={close}
          small
          outlined
        />

        <Button 
          type='submit'
          loading={loading}
          title='Configure'
          containerStyle='!w-[100px]'
          disabled={incorrect}
          small
        />
      </div>
    </form>
  )
}

export default ApiConfiguration