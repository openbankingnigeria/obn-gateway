'use client'

import { InputElement, ToggleSwitch } from '@/components/forms'
import { Button } from '@/components/globalComponents';
import clientAxiosRequest from '@/hooks/clientAxiosRequest';
import { APIConfigurationProps, KeyValueProps } from '@/types/webappTypes/appTypes';
import React, { useState } from 'react'
import * as API from '@/config/endpoints';
import { useRouter } from 'next/navigation';
import { AppCenterModal, TwoFactorAuthModal } from '@/app/(webapp)/(components)';
import { HeadersContainer, KeyValueContainer } from '.';

const UpStreamForm = ({
  rawData,
  profileData,
  preview
}: APIConfigurationProps) => {
  const [enable, setEnable] = useState(rawData?.enabled || false);
  const [headers, setHeaders] = useState<KeyValueProps[]>(
    rawData?.upstream?.headers ? [...rawData?.upstream?.headers] : []
  );
  const [body, setBody] = useState<KeyValueProps[]>(
    rawData?.upstream?.body ? [...rawData?.upstream?.body] : []
  );
  const [querystring, setQueryString] = useState<KeyValueProps[]>(
    rawData?.upstream?.querystring ? [...rawData?.upstream?.querystring] : []
  );
  const [endpointUrl, setEndpointUrl] = useState(rawData?.upstream?.url || '');

  const [open2FA, setOpen2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const environment = 'development';
  const router = useRouter();
  const previewPage = preview == 'true';

  // console.log(headers, body, querystring, rawData);

  const handleRemove = (type: string, value: string | number) => {
    type == 'body' ?
      setBody([...body].filter((item) => item.id !== value)) :
      type == 'headers' ?
        setHeaders([...headers].filter((item) => item.id !== value)) :
        setQueryString([...querystring].filter((item) => item.id !== value));
  };

  const handleInputChange = (value: string, obj: any, key: any, type: string) => {
    if (type == 'body') {
      const [oldBody] = body.filter((bdy) => bdy == obj);
      // @ts-ignore
      oldBody[key] = value;
  
      const newBodies = body;
      newBodies[body.indexOf(obj)] = oldBody;
      setBody([...newBodies]);
    } else if (type == 'headers') {
      const [oldHeader] = headers.filter((header) => header == obj);
      // @ts-ignore
      oldHeader[key] = value;
  
      const newHeaders = headers;
      newHeaders[headers.indexOf(obj)] = oldHeader;
      setHeaders([...newHeaders]);
    } else {
      const [oldQueryString] = querystring.filter((host) => host == obj);
      // @ts-ignore
      oldQueryString[key] = value;
  
      const newQueryStrings = querystring;
      newQueryStrings[querystring.indexOf(obj)] = oldQueryString;
      setQueryString([...newQueryStrings]);
    }
  }

  const handleAdd = (type: string) => {
    type == 'body' ?
      setBody(prev => [
        ...prev,
        {
          id: prev?.length,
          key: '',
          value: ''
        } 
      ]) :
      type == 'querystring' ?
        setQueryString(prev => [
          ...prev,
          {
            id: prev?.length,
            key: '',
            value: ''
          } 
        ]) :
        setHeaders(prev => [
          ...prev, 
          {
            id: prev?.length,
            key: '',
            value: ''
          }
        ])
  };

  // const incorrect = (
  //   headers?.length < 1 ||
  //   body?.length < 1 ||
  //   querystring?.length < 1 ||
  //   !endpointUrl
  // );

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
              url: endpointUrl,
              headers: headers?.map((header) => {
                return({
                  key: header?.key,
                  value: header?.value
                })
              }),
              body: body?.map((bdy) => {
                return({
                  key: bdy?.key,
                  value: bdy?.value
                })
              }),
              querystring: querystring?.map((qs) => {
                return({
                  key: qs?.key,
                  value: qs?.value
                })
              }),
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
            {
              !previewPage &&
              <div className='w-full flex items-center justify-between'>
                <div className='w-fit text-f14 font-[500] text-[#2B2E36]'>
                  Enable
                </div>

                <ToggleSwitch 
                  toggle={enable}
                  setToggle={previewPage ? ()=>null : setEnable}
                />
              </div>
            }

            <InputElement 
              name='endpointUrl'
              type='text'
              placeholder='Enter endpoint url'
              label='Endpoint URL'
              value={endpointUrl}
              disabled={previewPage}
              changeValue={setEndpointUrl}
              required
            />

          <div className='w-full flex flex-col gap-[12px]'>
            <KeyValueContainer 
              data={headers}
              handleInputChange={handleInputChange}
              handleRemove={handleRemove}
              handleAdd={handleAdd}
              preview={previewPage}
              keyPlaceholder='Enter a header key'
              valuePlaceholder='Enter a header value'
              type='headers'
              label='Headers'
            />
          </div>

          <div className='w-full flex flex-col gap-[12px]'>
            <KeyValueContainer 
              data={body}
              handleInputChange={handleInputChange}
              handleRemove={handleRemove}
              handleAdd={handleAdd}
              preview={previewPage}
              keyPlaceholder='Enter a body key'
              valuePlaceholder='Enter a body value'
              type='body'
              label='Body'
            />
          </div>

          <div className='w-full flex flex-col gap-[12px]'>
            <KeyValueContainer 
              data={querystring}
              handleInputChange={handleInputChange}
              handleRemove={handleRemove}
              handleAdd={handleAdd}
              preview={previewPage}
              keyPlaceholder='Enter a querystring key'
              valuePlaceholder='Enter a querystring value'
              type='querystring'
              label='Query string'
            />
          </div>

            {/* <div className='w-full flex items-end gap-[12px]'>
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
            </div> */}

            {
              !previewPage &&
              <div className='w-full flex justify-end'>
                <Button 
                  title='Save changes'
                  type='submit'
                  loading={loading}
                  containerStyle='!w-[120px]'
                  // disabled={incorrect}
                  small
                />
              </div>
            }
          </div>
        </div>
      </form>
    </>
  )
}

export default UpStreamForm